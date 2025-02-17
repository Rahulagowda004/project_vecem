from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
import json
import os
import logging
from datetime import datetime
from models import DatasetInfo, UploadResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure paths - use absolute paths first
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
RAW_DIR = os.path.join(UPLOAD_DIR, "raw")
VECTORIZED_DIR = os.path.join(UPLOAD_DIR, "vectorized")
METADATA_DIR = os.path.join(UPLOAD_DIR, "metadata")

def ensure_directories():
    """Ensure all required directories exist"""
    try:
        for dir_path in [UPLOAD_DIR, RAW_DIR, VECTORIZED_DIR, METADATA_DIR]:
            os.makedirs(dir_path, exist_ok=True)
            logger.info(f"Ensured directory exists: {dir_path}")
    except Exception as e:
        logger.error(f"Error creating directories: {e}")
        raise

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

@app.post("/upload")
async def upload_files(
    files: List[UploadFile] = File(None),
    raw_files: List[UploadFile] = File(None),
    vectorized_files: List[UploadFile] = File(None),
    type: str = Form(...),
    datasetInfo: str = Form(...)
):
    try:
        dataset_info = DatasetInfo(**json.loads(datasetInfo))
        logger.info(f"Dataset info: {dataset_info}")
        
        uploaded_files = {"raw": [], "vectorized": []}
        
        if type.lower() == "both":
            # Handle both raw and vectorized files
            if raw_files:
                base_name = dataset_info.datasetId or dataset_info.name
                raw_dir = os.path.join(RAW_DIR, f"{base_name}_raw")
                os.makedirs(raw_dir, exist_ok=True)
                
                for file in raw_files:
                    if file.filename:
                        safe_filename = os.path.basename(file.filename)
                        file_path = os.path.join(raw_dir, safe_filename)
                        content = await file.read()
                        with open(file_path, "wb") as f:
                            f.write(content)
                        uploaded_files["raw"].append(safe_filename)
                        
            if vectorized_files:
                base_name = dataset_info.datasetId or dataset_info.name
                vectorized_dir = os.path.join(VECTORIZED_DIR, f"{base_name}_vectorized")
                os.makedirs(vectorized_dir, exist_ok=True)
                
                for file in vectorized_files:
                    if file.filename:
                        safe_filename = os.path.basename(file.filename)
                        file_path = os.path.join(vectorized_dir, safe_filename)
                        content = await file.read()
                        with open(file_path, "wb") as f:
                            f.write(content)
                        uploaded_files["vectorized"].append(safe_filename)

            # Create single metadata for both types
            extra_info = {
                "upload_type": "both",
                "description": dataset_info.description,
                "raw_files": {
                    "count": len(uploaded_files["raw"]),
                    "files": uploaded_files["raw"],
                    "directory": os.path.join(RAW_DIR, f"{base_name}_raw")
                },
                "vectorized_files": {
                    "count": len(uploaded_files["vectorized"]),
                    "files": uploaded_files["vectorized"],
                    "directory": os.path.join(VECTORIZED_DIR, f"{base_name}_vectorized")
                },
                "dimensions": dataset_info.dimensions,
                "vector_database": dataset_info.vectorDatabase,
                "file_type": dataset_info.dict().get("file_type", "unknown")
            }
            
            if not uploaded_files["raw"] and not uploaded_files["vectorized"]:
                raise HTTPException(status_code=400, detail="No valid files were uploaded")
            
            metadata_path = await save_metadata(
                dataset_info,
                "both",
                uploaded_files["raw"] + uploaded_files["vectorized"],
                extra_info
            )
            
            return UploadResponse(
                success=True,
                message=f"Successfully uploaded {len(uploaded_files['raw'])} raw files and {len(uploaded_files['vectorized'])} vectorized files. Metadata saved at {metadata_path}",
                files=uploaded_files["raw"] + uploaded_files["vectorized"]
            )
            
        else:
            if not files:
                raise HTTPException(status_code=400, detail="No files provided")
            
            logger.info(f"Received upload request - Type: {type}")
            logger.info(f"Number of files: {len(files)}")
            
            # Create dataset-specific directory using datasetId for combined datasets
            base_name = dataset_info.datasetId if dataset_info.datasetId else dataset_info.name
            dataset_dir = os.path.join(
                VECTORIZED_DIR if type.lower() == "vectorized" else RAW_DIR,
                f"{base_name}_{type.lower()}"
            )
            os.makedirs(dataset_dir, exist_ok=True)
            
            uploaded_files_list = []
        
            for file in files:
                if not file.filename:
                    continue
                    
                logger.info(f"Processing file: {file.filename}")
                safe_filename = os.path.basename(file.filename)
                file_path = os.path.join(dataset_dir, safe_filename)
                
                content = await file.read()
                with open(file_path, "wb") as f:
                    f.write(content)
                
                uploaded_files_list.append(safe_filename)
                logger.info(f"Saved file: {file_path}")
            
            if not uploaded_files_list:
                raise HTTPException(status_code=400, detail="No valid files were uploaded")
            
            # Enhanced metadata for uploads
            extra_info = {
                "upload_directory": dataset_dir,
                "file_count": len(uploaded_files_list),
                "upload_type": type,
                "description": dataset_info.description,
                "file_type": dataset_info.dict().get("file_type", "unknown")
            }
            
            if type.lower() == "vectorized":
                extra_info.update({
                    "dimensions": dataset_info.dimensions,
                    "vector_database": dataset_info.vectorDatabase
                })
            
            metadata_path = await save_metadata(dataset_info, type, uploaded_files_list, extra_info)
            
            return UploadResponse(
                success=True,
                message=f"Successfully uploaded {len(uploaded_files_list)} {type} files. Metadata saved at {metadata_path}",
                files=uploaded_files_list
            )

    except Exception as e:
        logger.error(f"Error during upload: {e}")
        raise HTTPException(status_code=500, detail=f"Error uploading files: {str(e)}")

@app.get("/")
async def root():
    return {"message": "File Upload API is running"}

# Shutdown event to close MongoDB connection
@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()