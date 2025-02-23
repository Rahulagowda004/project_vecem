from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
import os
import json
from datetime import datetime
from src.utils.logger import logging
from src.models.uploads import DatasetInfo, UploadResponse
from src.utils.file_handlers import ensure_directories, save_uploaded_file
from src.database.mongodb import save_metadata
from src.config.settings import UPLOAD_DIR

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_files(
    files: List[UploadFile] = File(None),
    raw_files: List[UploadFile] = File(None),
    vectorized_files: List[UploadFile] = File(None),
    type: str = Form(...),
    datasetInfo: str = Form(...)
):
    try:
        # Parse dataset info
        dataset_info = DatasetInfo.parse_raw(datasetInfo)
        dataset_id = dataset_info.datasetId or f"{dataset_info.name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        dataset_dir = os.path.join(UPLOAD_DIR, dataset_id)

        if not ensure_directories(dataset_dir):
            raise HTTPException(status_code=500, detail="Could not create upload directory")

        uploaded_files = {"raw": [], "vectorized": []}

        # Handle file uploads based on type
        if type.lower() == "both":
            if raw_files:
                raw_dir = os.path.join(dataset_dir, "raw")
                ensure_directories(raw_dir)
                for file in raw_files:
                    if filename := await save_uploaded_file(file, raw_dir):
                        uploaded_files["raw"].append(filename)

            if vectorized_files:
                vec_dir = os.path.join(dataset_dir, "vectorized")
                ensure_directories(vec_dir)
                for file in vectorized_files:
                    if filename := await save_uploaded_file(file, vec_dir):
                        uploaded_files["vectorized"].append(filename)
        else:
            if files:
                type_dir = os.path.join(dataset_dir, type.lower())
                ensure_directories(type_dir)
                for file in files:
                    if filename := await save_uploaded_file(file, type_dir):
                        uploaded_files[type.lower()].append(filename)

        # Prepare and save metadata
        metadata = {
            "dataset_id": dataset_id,
            "dataset_info": dataset_info.dict(),
            "upload_type": type.lower(),
            "timestamp": datetime.now().isoformat(),
            "files": uploaded_files,
            "base_directory": dataset_dir
        }

        # Save metadata to MongoDBs
        await save_metadata(metadata)

        all_files = uploaded_files.get("raw", []) + uploaded_files.get("vectorized", [])
        return UploadResponse(
            success=True,
            message=f"Successfully uploaded dataset {dataset_id}",
            files=all_files
        )

    except Exception as e:
        logging.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
