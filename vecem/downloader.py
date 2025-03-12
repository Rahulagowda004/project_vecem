import os
import requests
import zipfile
from typing import Optional, Union, List
from pathlib import Path
import tempfile

class VecemDataset:
    def __init__(self, dataset_path: str):
        """Initialize VecemDataset with a path like 'username/datasetname/type'"""
        parts = dataset_path.strip('/').split('/')
        if len(parts) != 3:
            raise ValueError("Dataset path must be in format: username/datasetname/type")
        
        self.username = parts[0]
        self.dataset_name = parts[1]
        self.file_type = parts[2]
        self.base_url = "https://vecem.blob.core.windows.net/datasets"
    
    def download(self, output_dir: Optional[Union[str, Path]] = None) -> str:
        """Download and extract the dataset to the specified directory"""
        if output_dir is None:
            output_dir = os.getcwd()
        
        output_dir = Path(output_dir)
        dataset_dir = output_dir / f"{self.dataset_name}_{self.file_type}"
        os.makedirs(dataset_dir, exist_ok=True)
        
        # Create a temporary file for the zip
        with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as temp_zip:
            url = f"{self.base_url}/{self.username}/{self.dataset_name}/{self.file_type}.zip"
            
            # Download to temporary file
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            for chunk in response.iter_content(chunk_size=8192):
                temp_zip.write(chunk)
            
            temp_zip.close()
            
            # Extract the zip file
            with zipfile.ZipFile(temp_zip.name, 'r') as zip_ref:
                zip_ref.extractall(dataset_dir)
            
            # Clean up the temporary zip file
            os.unlink(temp_zip.name)
        
        return str(dataset_dir)

def load_dataset(dataset_path: str, output_dir: Optional[Union[str, Path]] = None) -> str:
    """
    Helper function to quickly download a dataset.
    
    Args:
        dataset_path: Path in format 'username/datasetname/type'
        output_dir: Directory to save the dataset (optional)
    
    Returns:
        Path to the downloaded file
    """
    dataset = VecemDataset(dataset_path)
    return dataset.download(output_dir)
