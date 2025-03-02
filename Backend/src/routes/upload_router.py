from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
import os
import json
from datetime import datetime
from src.utils.logger import logging
from src.models.models import DatasetInfo, UploadResponse
from src.utils.file_handlers import ensure_directories, save_uploaded_file
from src.database.mongodb import save_metadata_and_update_user, user_profile_collection  # Add this import
from src.utils.azure_storage import upload_to_blob, delete_dataset_blobs

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
        if not uid:
            raise HTTPException(status_code=400, detail="User ID is required")

        # Get user profile to fetch username
        user_profile = await user_profile_collection.find_one({"uid": uid})
        if not user_profile:
            raise HTTPException(status_code=404, detail="User not found")
        
        username = user_profile.get("username")

        # Parse dataset info
        dataset_info = DatasetInfo.parse_raw(datasetInfo)
        dataset_info_dict = dataset_info.dict()
        dataset_info_dict["username"] = username  # Add username to dataset_info
        dataset_info_dict.pop('uid', None)  # Remove uid from dataset_info
        
        dataset_id = dataset_info.datasetId or f"{dataset_info.name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        uploaded_files = {"raw": [], "vectorized": []}

        # Handle file uploads based on type
        if type.lower() == "both":
            if raw_files:
                for file in raw_files:
                    blob_url = await upload_to_blob(file, dataset_id, "raw")
                    uploaded_files["raw"].append(blob_url)

            if vectorized_files:
                for file in vectorized_files:
                    blob_url = await upload_to_blob(file, dataset_id, "vectorized")
                    uploaded_files["vectorized"].append(blob_url)
        else:
            if files:
                for file in files:
                    blob_url = await upload_to_blob(file, dataset_id, type.lower())
                    uploaded_files[type.lower()].append(blob_url)

        # Prepare and save metadata
        metadata = {
            "dataset_id": dataset_id,
            "dataset_info": dataset_info_dict,  # dataset_info without uid
            "upload_type": type.lower(),
            "timestamp": datetime.now().isoformat(),
            "files": uploaded_files,
            "uid": uid  # uid only stored at root level
        }

        # Save metadata and update user profile
        await save_metadata_and_update_user(metadata)

        all_files = uploaded_files.get("raw", []) + uploaded_files.get("vectorized", [])
        return UploadResponse(
            success=True,
            message=f"Successfully uploaded dataset {dataset_id}",
            files=all_files
        )

    except Exception as e:
        logging.error(f"Upload error: {str(e)}")
        await delete_dataset_blobs(dataset_id)
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/datasets/{dataset_id}")
async def delete_dataset(dataset_id: str):
    try:
        # Delete files from Azure Blob Storage
        await delete_dataset_blobs(dataset_id)
        
        # Delete dataset document from MongoDB
        result = await datasets_collection.delete_one({"dataset_id": dataset_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        return {"message": "Dataset deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
