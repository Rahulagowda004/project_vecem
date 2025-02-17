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

app = FastAPI()

# MongoDB setup
MONGO_URL = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URL)
db = client.vecem_db
datasets_collection = db.datasets

# Configure paths - use absolute paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
RAW_DIR = os.path.join(UPLOAD_DIR, "raw")
VECTORIZED_DIR = os.path.join(UPLOAD_DIR, "vectorized")
METADATA_DIR = os.path.join(UPLOAD_DIR, "metadata")

# Create necessary directories
for dir_path in [RAW_DIR, VECTORIZED_DIR, METADATA_DIR]:
    os.makedirs(dir_path, exist_ok=True)

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
    
    # Save to JSON file
    with open(filepath, "w") as f:
        json.dump(metadata, f, indent=2)
    
    # Save to MongoDB with dataset linking
    try:
        # If this is part of a combined dataset, add a reference
        if dataset_info.datasetId:
            metadata["combined_dataset_id"] = dataset_info.datasetId
        
        result = await datasets_collection.insert_one(metadata)
        logger.info(f"Metadata saved to MongoDB for dataset: {dataset_info.name}")
        
        # If this is part of a combined dataset, update the references
        if dataset_info.datasetId:
            await datasets_collection.update_many(
                {"combined_dataset_id": dataset_info.datasetId},
                {"$set": {"related_uploads": [str(result.inserted_id)]}}
            )
    except Exception as e:
        logger.error(f"Error saving to MongoDB: {e}")
    
    return filepath

@app.post("/upload")
async def upload_files(
    files: List[UploadFile] = File(...),
    type: str = Form(...),
    datasetInfo: str = Form(...)
):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    logger.info(f"Received upload request - Type: {type}")
    logger.info(f"Number of files: {len(files)}")
    
    try:
        dataset_info = DatasetInfo(**json.loads(datasetInfo))
        logger.info(f"Dataset info: {dataset_info}")
        
        # Create dataset-specific directory using datasetId for combined datasets
        base_name = dataset_info.datasetId if dataset_info.datasetId else dataset_info.name
        dataset_dir = os.path.join(
            VECTORIZED_DIR if type.lower() == "vectorized" else RAW_DIR,
            f"{base_name}_{type.lower()}"
        )
        os.makedirs(dataset_dir, exist_ok=True)
        
        uploaded_files = []
    
        for file in files:
            if not file.filename:
                continue
                
            logger.info(f"Processing file: {file.filename}")
            safe_filename = os.path.basename(file.filename)
            file_path = os.path.join(dataset_dir, safe_filename)
            
            # Read in chunks for large files
            content = await file.read()
            with open(file_path, "wb") as f:
                f.write(content)
            
            uploaded_files.append(safe_filename)
            logger.info(f"Saved file: {file_path}")
        
        if not uploaded_files:
            raise HTTPException(status_code=400, detail="No valid files were uploaded")
        
        # Enhanced metadata for uploads
        extra_info = {
            "upload_directory": dataset_dir,
            "file_count": len(uploaded_files),
            "upload_type": type,
            "file_type": dataset_info.dict().get("file_type", "unknown")
        }
        
        if type.lower() == "vectorized":
            extra_info.update({
                "dimensions": dataset_info.dimensions,
                "vector_database": dataset_info.vectorDatabase
            })
        
        metadata_path = await save_metadata(dataset_info, type, uploaded_files, extra_info)
        
        return UploadResponse(
            success=True,
            message=f"Successfully uploaded {len(uploaded_files)} {type} files. Metadata saved at {metadata_path}",
            files=uploaded_files
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