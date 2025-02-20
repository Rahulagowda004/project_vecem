from pydantic import BaseModel
from typing import List, Optional

class DatasetInfo(BaseModel):
    name: str
    description: Optional[str] = None
    datasetId: Optional[str] = None

class UploadResponse(BaseModel):
    success: bool
    message: str
    files: List[str]