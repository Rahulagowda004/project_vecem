import os
import requests
from typing import Optional, Union, List
from pathlib import Path

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
        """Download the dataset to the specified directory"""
        if output_dir is None:
            output_dir = os.getcwd()
        
        output_dir = Path(output_dir)
        os.makedirs(output_dir, exist_ok=True)
        
        url = f"{self.base_url}/{self.username}/{self.dataset_name}/{self.file_type}.zip"
        output_file = output_dir / f"{self.dataset_name}_{self.file_type}.zip"
        
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        with open(output_file, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        return str(output_file)

def download_dataset(dataset_path: str, output_dir: Optional[Union[str, Path]] = None) -> str:
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
