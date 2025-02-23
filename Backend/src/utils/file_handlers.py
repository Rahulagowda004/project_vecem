import os
from fastapi import UploadFile
from src.config.settings import logger

def ensure_directories(directory_path: str) -> bool:
    try:
        os.makedirs(directory_path, exist_ok=True)
        logger.info(f"Created directory: {directory_path}")
        return True
    except Exception as e:
        logger.error(f"Error creating directory: {e}")
        return False

async def save_uploaded_file(file: UploadFile, directory: str) -> str:
    if not file.filename:
        return None

    safe_filename = os.path.basename(file.filename)
    file_path = os.path.join(directory, safe_filename)

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
