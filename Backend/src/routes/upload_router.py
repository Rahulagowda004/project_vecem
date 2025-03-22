from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
import os
import json
from datetime import datetime
from src.utils.logger import logging
from src.models.models import DatasetInfo, UploadResponse
from src.utils.file_handlers import ensure_directories, save_uploaded_file
from src.database.mongodb import (
    save_metadata_and_update_user, 
    user_profile_collection,
    datasets_collection # Add this import
)
from src.utils.azure_storage import upload_to_blob, delete_dataset_blobs, create_and_upload_zip
from bson import ObjectId

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_files(
    files: List[UploadFile] = File(None),
    raw_files: List[UploadFile] = File(None),
    vectorized_files: List[UploadFile] = File(None),
    type: str = Form(...),
    datasetInfo: str = Form(...),
    uid: str = Form(...)
):
    try:
        logging.info(f"Upload request received - UID: {uid}, Type: {type}")
        
        if not uid:
            raise HTTPException(status_code=400, detail="User ID is required")

        # Get user profile and validate
        user_profile = await user_profile_collection.find_one({"uid": uid})
        if not user_profile:
            raise HTTPException(status_code=404, detail=f"User not found for ID: {uid}")
        
        username = user_profile.get("username")
        if not username:
            raise HTTPException(status_code=400, detail="Username not found")

        dataset_info = json.loads(datasetInfo)
        is_edit = dataset_info.pop('isEdit', False)
        dataset_id = dataset_info.get('datasetId')
        dataset_name = dataset_info['name'].replace(" ", "_").lower()

        # Initialize files dictionary preserving existing files
        uploaded_files = {"raw": [], "vectorized": []}

        if is_edit and dataset_id:
            # Get existing dataset
            existing_dataset = await datasets_collection.find_one({"_id": ObjectId(dataset_id)})
            if existing_dataset and "files" in existing_dataset:
                uploaded_files = existing_dataset["files"]

        try:
            # Handle file uploads
            if type == "raw" and raw_files:
                raw_url = await create_and_upload_zip(raw_files, username, dataset_name, "raw")
                uploaded_files["raw"] = [raw_url]
            elif type == "vectorized" and vectorized_files:
                vec_url = await create_and_upload_zip(vectorized_files, username, dataset_name, "vectorized")
                uploaded_files["vectorized"] = [vec_url]

            # Update database
            if is_edit and dataset_id:
                result = await datasets_collection.update_one(
                    {"_id": ObjectId(dataset_id)},
                    {"$set": {
                        "files": uploaded_files,
                        "timestamp": datetime.now().isoformat()
                    }}
                )
                if result.modified_count == 0:
                    raise HTTPException(status_code=404, detail="Dataset not found")

            logging.info(f"Files uploaded successfully - Type: {type}, Files: {uploaded_files}")

            return UploadResponse(
                success=True,
                message=f"Successfully uploaded {type} files",
                files=uploaded_files.get(type, [])
            )

        except Exception as upload_error:
            logging.error(f"Upload error: {str(upload_error)}")
            await delete_dataset_blobs(dataset_name, username)
            raise upload_error

    except Exception as e:
        logging.error(f"Upload error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error during upload: {str(e)}"
        )

@router.delete("/datasets/{dataset_id}")
async def delete_dataset(dataset_id: str):
    try:
        # Get dataset info to fetch username and dataset name
        dataset = await datasets_collection.find_one({"dataset_id": dataset_id})
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        username = dataset.get("dataset_info", {}).get("username")
        dataset_name = dataset.get("dataset_info", {}).get("name", "").replace(" ", "_").lower()
        
        if not username or not dataset_name:
            raise HTTPException(status_code=400, detail="Username or dataset name not found")
        
        # Delete files from Azure Blob Storage
        await delete_dataset_blobs(dataset_name, username)
        
        # Delete dataset document from MongoDB
        result = await datasets_collection.delete_one({"dataset_id": dataset_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        return {"message": "Dataset deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
