# Vecemlib

A Python library for downloading datasets from Vecem.

## Installation

```bash
pip install vecemlib
```

## Usage

There are two ways to download datasets:

1. Using the `load_dataset` function:

```python
from vecemlib import load_dataset

# Download dataset to current directory
file_path = load_dataset("username/datasetname/raw")

# Download to specific directory
file_path = load_dataset("username/datasetname/raw", "path/to/output")
```

2. Using the `VecemDataset` class:

```python
from vecemlib import VecemDataset

# Create dataset object
dataset = VecemDataset("username/datasetname/raw")

# Download dataset
file_path = dataset.download("path/to/output")
```

## Examples

```python
# Download raw dataset
load_dataset("NaveenGowdavecemYQsIi9/dfpabsl/raw")

# Download vectorized dataset
load_dataset("NaveenGowdavecemYQsIi9/dfpabsl/vectorized")
```
