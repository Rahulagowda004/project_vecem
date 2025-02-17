from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json
import os
from models import DatasetInfo, UploadResponse
from datetime import datetime

app = FastAPI()

# Configure paths
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
    allow_origins=["http://localhost:5173"],  # Updated port for Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def save_metadata(dataset_info: DatasetInfo, upload_type: str, files: List[str]):
    """Save dataset metadata to a JSON file"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    metadata = {
        "dataset_info": dataset_info.dict(),
        "upload_type": upload_type,
        "files": files,
        "timestamp": timestamp
    }
    
    filename = f"{dataset_info.name}_{timestamp}.json"
    filepath = os.path.join(METADATA_DIR, filename)
    
    with open(filepath, "w") as f:
        json.dump(metadata, f, indent=2)
    
    return filepath

@app.post("/upload")
async def upload_files(
    files: List[UploadFile] = File(...),
    type: str = Form(...),
    datasetInfo: str = Form(...)
):
    dataset_info = DatasetInfo(**json.loads(datasetInfo))
    upload_path = RAW_DIR if type == "raw" else VECTORIZED_DIR
    
    # Create dataset-specific directory
    dataset_dir = os.path.join(upload_path, dataset_info.name)
    os.makedirs(dataset_dir, exist_ok=True)
    
    uploaded_files = []
    
    try:
        # Save uploaded files
        for file in files:
            # Create safe filename
            safe_filename = os.path.basename(file.filename)
            file_path = os.path.join(dataset_dir, safe_filename)
            
            # Save file
            content = await file.read()
            with open(file_path, "wb") as f:
                f.write(content)
            
            uploaded_files.append(safe_filename)
        
        # Save metadata
        metadata_path = save_metadata(dataset_info, type, uploaded_files)
        
        return UploadResponse(
            success=True,
            message=f"Successfully uploaded {len(uploaded_files)} files. Metadata saved at {metadata_path}",
            files=uploaded_files
        )
        
    except Exception as e:
        return UploadResponse(
            success=False,
            message=f"Error uploading files: {str(e)}",
            files=uploaded_files
        )

@app.get("/")
async def root():
    return {"message": "File Upload API is running"}