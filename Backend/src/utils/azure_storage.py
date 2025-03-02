from azure.storage.blob import BlobServiceClient
from fastapi import UploadFile
import os

STORAGE_ACCOUNT_URL = "https://vecem.blob.core.windows.net"
SAS_TOKEN = "sp=racwd&st=2025-02-19T16:15:56Z&se=2099-02-20T00:15:56Z&spr=https&sv=2022-11-02&sr=c&sig=ku6eP3I24d7lanXfI0OJgt4lKWO3jL3r0tgjXl6OS8Y%3D"
CONTAINER_NAME = "datasets"

blob_service_client = BlobServiceClient(account_url=STORAGE_ACCOUNT_URL, credential=SAS_TOKEN)
container_client = blob_service_client.get_container_client(CONTAINER_NAME)

async def upload_to_blob(file: UploadFile, dataset_id: str, file_type: str) -> str:
    try:
        # Create a unique blob path: dataset_id/file_type/filename
        blob_path = f"{dataset_id}/{file_type}/{file.filename}"
        blob_client = container_client.get_blob_client(blob_path)
        
        # Read file content
        file_content = await file.read()
        
        # Upload the file
        blob_client.upload_blob(file_content, overwrite=True)
        
        # Return the blob URL
        return blob_client.url
        
    except Exception as e:
        print(f"Error uploading to blob storage: {str(e)}")
        raise e

async def delete_dataset_blobs(dataset_id: str):
    try:
        # List all blobs in the dataset directory
        blob_list = container_client.list_blobs(name_starts_with=f"{dataset_id}/")
        
        # Delete each blob
        for blob in blob_list:
            container_client.delete_blob(blob.name)
            
    except Exception as e:
        print(f"Error deleting blobs: {str(e)}")
        raise e
