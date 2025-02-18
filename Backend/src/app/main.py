from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
import json
import os
import logging
from datetime import datetime
from models import DatasetInfo, UploadResponse

# Configure logging with more detail
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Update path configuration to use proper absolute paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

def ensure_directories():
    """Ensure all required directories exist"""
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        logger.info(f"Base upload directory: {UPLOAD_DIR}")
        return True
    except Exception as e:
        logger.error(f"Error creating upload directory: {e}")
        return False

app = FastAPI()

# Initialize directories
ensure_directories()

# MongoDB setup
MONGO_URL = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URL)
db = client.vecem_db
datasets_collection = db.datasets

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def save_metadata(dataset_info: DatasetInfo, upload_type: str, files: List[str], extra_info: dict = None):
    """Save dataset metadata to both JSON file and MongoDB"""
    try:
        # Ensure metadata directory exists
        os.makedirs(METADATA_DIR, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Base metadata
        metadata = {
            "dataset_info": dataset_info.dict(),
            "upload_type": upload_type,
            "files": files,
            "timestamp": timestamp
        }
        
        if extra_info:
            metadata.update(extra_info)
        
        # For combined datasets, use the dataset ID in the filename
        if dataset_info.datasetId:
            filename = f"{dataset_info.datasetId}_{upload_type}_{timestamp}.json"
        else:
            filename = f"{dataset_info.name}_{upload_type}_{timestamp}.json"
        
        filepath = os.path.join(METADATA_DIR, filename)
        logger.info(f"Saving metadata to: {filepath}")
        
        # Save to JSON file
        with open(filepath, "w") as f:
            json.dump(metadata, f, indent=2)
        
        # Save to MongoDB with dataset linking
        try:
            if dataset_info.datasetId:
                metadata["combined_dataset_id"] = dataset_info.datasetId
            
            result = await datasets_collection.insert_one(metadata)
            logger.info(f"Metadata saved to MongoDB for dataset: {dataset_info.name}")
            
            if dataset_info.datasetId:
                await datasets_collection.update_many(
                    {"combined_dataset_id": dataset_info.datasetId},
                    {"$set": {"related_uploads": [str(result.inserted_id)]}}
                )
        except Exception as e:
            logger.error(f"Error saving to MongoDB: {e}")
            # Continue even if MongoDB fails
        
        return filepath
        
    except Exception as e:
        logger.error(f"Error in save_metadata: {e}")
        raise

@app.post("/upload", response_model=UploadResponse)
async def upload_files(
    files: List[UploadFile] = File(None),
    raw_files: List[UploadFile] = File(None),
    vectorized_files: List[UploadFile] = File(None),
    type: str = Form(...),
    datasetInfo: str = Form(...)
):
    try:
        # Ensure base upload directory exists
        if not ensure_directories():
            raise HTTPException(status_code=500, detail="Could not create upload directory")

        # Parse dataset info and create dataset directory
        dataset_info = DatasetInfo.parse_raw(datasetInfo)
        dataset_id = dataset_info.datasetId or f"{dataset_info.name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        # Create dataset-specific directory
        dataset_dir = os.path.join(UPLOAD_DIR, dataset_id)
        try:
            os.makedirs(dataset_dir, exist_ok=True)
            logger.info(f"Created dataset directory: {dataset_dir}")
        except Exception as e:
            logger.error(f"Failed to create dataset directory: {e}")
            raise HTTPException(status_code=500, detail="Failed to create dataset directory")

        # Function to ensure subdirectory exists
        def ensure_subdir(subdir_type: str) -> str:
            subdir = os.path.join(dataset_dir, subdir_type)
            os.makedirs(subdir, exist_ok=True)
            return subdir

        uploaded_files = {"raw": [], "vectorized": []}

        async def save_file(file: UploadFile, subdir_type: str) -> str:
            if not file.filename:
                return None

            subdir = ensure_subdir(subdir_type)
            safe_filename = os.path.basename(file.filename)
            file_path = os.path.join(subdir, safe_filename)

            try:
                content = await file.read()
                if not content:
                    return None

                with open(file_path, "wb") as f:
                    f.write(content)
                logger.info(f"Saved file: {file_path}")
                return safe_filename
            except Exception as e:
                logger.error(f"Error saving file {safe_filename}: {str(e)}")
                return None

        # Handle file uploads
        if type.lower() == "both":
            if raw_files:
                for file in raw_files:
                    if filename := await save_file(file, "raw"):
                        uploaded_files["raw"].append(filename)

            if vectorized_files:
                for file in vectorized_files:
                    if filename := await save_file(file, "vectorized"):
                        uploaded_files["vectorized"].append(filename)
        else:
            if files:
                for file in files:
                    if filename := await save_file(file, type.lower()):
                        uploaded_files[type.lower()].append(filename)

        # Save metadata
        metadata_dir = ensure_subdir("metadata")
        metadata = {
            "dataset_id": dataset_id,
            "dataset_info": dataset_info.dict(),
            "upload_type": type.lower(),
            "timestamp": datetime.now().isoformat(),
            "files": uploaded_files,
            "base_directory": dataset_dir
        }

        metadata_path = os.path.join(metadata_dir, f"metadata.json")
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

        # Save to MongoDB
        try:
            insert_result = await datasets_collection.insert_one(metadata)
            logger.info(f"Saved to MongoDB with ID: {insert_result.inserted_id}")
        except Exception as e:
            logger.error(f"MongoDB error: {str(e)}")

        all_files = uploaded_files.get("raw", []) + uploaded_files.get("vectorized", [])
        return UploadResponse(
            success=True,
            message=f"Successfully uploaded dataset {dataset_id}",
            files=all_files
        )

    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "File Upload API is running"}

# Shutdown event to close MongoDB connection
@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()