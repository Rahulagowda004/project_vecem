import os
from typing import Optional, Union, List
from pathlib import Path
import tempfile
import zipfile
from azure.storage.blob import BlobServiceClient
from azure.core.exceptions import ResourceNotFoundError
from .config import AZURE_STORAGE_CONNECTION_STRING, CONTAINER_NAME

def list_datasets() -> List[str]:
    """List all available datasets in the container"""
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
    container_client = blob_service_client.get_container_client(CONTAINER_NAME)
    
    datasets = []
    try:
        # List all blobs in the container
        blobs = container_client.list_blobs()
        for blob in blobs:
            if blob.name.endswith('.zip'):
                # Convert blob path to dataset format
                path = blob.name.rsplit('.', 1)[0]  # Remove .zip extension
                datasets.append(path)
    except Exception as e:
        print(f"Error listing datasets: {str(e)}")
    
    return datasets
