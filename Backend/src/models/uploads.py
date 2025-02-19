from pydantic import BaseModel
from typing import Optional, List

class DatasetInfo(BaseModel):
    name: str
    description: str
    domain: str
    dimensions: Optional[int] = None
    vectorDatabase: Optional[str] = None
    datasetId: Optional[str] = None  # Used to link related datasets
    file_type: Optional[str] = None

class UploadResponse(BaseModel):
    success: bool
    message: str
    files: List[str]