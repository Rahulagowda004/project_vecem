import sys
import os

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from vecem import load_dataset
from vecem.downloader import list_datasets

try:
    # First, list available datasets
    print("Available datasets:")
    datasets = list_datasets()
    for dataset in datasets:
        print(f"- {dataset}")
    
    if datasets:
        # Try downloading the first available dataset
        dataset_path = load_dataset(datasets[0])
        print(f"\nSuccessfully downloaded dataset to: {dataset_path}")
    else:
        print("\nNo datasets found in the container!")

except Exception as e:
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
