import os
from azure.storage.blob import BlobServiceClient

# Azure Storage Configuration
AZURE_CONNECTION_STRING = "your_azure_connection_string"  # Replace with your actual connection string
CONTAINER_NAME = "datasets"  # Your Azure Blob Storage container name

# Initialize the BlobServiceClient
blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
container_client = blob_service_client.get_container_client(CONTAINER_NAME)

def download_dataset(dataset_name, save_path="downloads"):
    """
    Downloads a dataset from Azure Blob Storage.

    Args:
        dataset_name (str): Name of the file in Azure Blob Storage.
        save_path (str): Local directory to save the file.
    
    Returns:
        str: Local file path if successful, None otherwise.
    """
    # Create the local save directory if it doesn’t exist
    os.makedirs(save_path, exist_ok=True)

    # File path in Azure
    blob_name = f"{dataset_name}.zip"  
    local_file_path = os.path.join(save_path, blob_name)

    try:
        blob_client = container_client.get_blob_client(blob_name)
        with open(local_file_path, "wb") as file:
            file.write(blob_client.download_blob().readall())
        
        print(f"✅ Download successful: {local_file_path}")
        return local_file_path
    except Exception as e:
        print(f"❌ Download failed: {e}")
        return None
