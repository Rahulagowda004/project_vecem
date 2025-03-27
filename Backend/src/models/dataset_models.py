from pydantic import BaseModel, Field, HttpUrl
from typing import List, Dict, Optional
from datetime import datetime

class DatasetInfo(BaseModel):
    name: str
    description: str
    datasetId: str
    domain: str
    license: str
    file_type: str
    dimensions: Optional[int] = None
    vector_database: Optional[str] = None
    model_name: Optional[str] = None
    username: str
    isEdit: Optional[bool] = False

class Files(BaseModel):
    raw: List[HttpUrl] = []
    vectorized: List[HttpUrl] = []

class DatasetSchema(BaseModel):
    id: str = Field(..., alias="_id")
    dataset_id: str
    dataset_info: DatasetInfo
    upload_type: str
    timestamp: datetime
    files: Files
    uid: str
    
    class Config:
        populate_by_name = True # Updated from allow_population_by_field_name
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
