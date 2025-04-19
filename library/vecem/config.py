import os

# Load Azure Storage configuration from environment variables
AZURE_STORAGE_CONNECTION_STRING = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
if not AZURE_STORAGE_CONNECTION_STRING:
    raise ValueError("AZURE_STORAGE_CONNECTION_STRING environment variable is required")

CONTAINER_NAME = os.getenv('AZURE_CONTAINER_NAME', 'datasets')
