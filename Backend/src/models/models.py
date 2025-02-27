from pydantic import BaseModel, Field
from typing import List, Optional

# User Models
class User(BaseModel):
    uid: str
    email: str
    username: str = Field(..., description="Auto-generated unique username")
    name: Optional[str] = None

class UidRequest(BaseModel):
    uid: str
    email: str
    name: str

class DatasetInfo(BaseModel):
    name: str
    description: Optional[str] = None
    datasetId: Optional[str] = None
    uid: str = Field(..., description="User ID is required")
    domain: Optional[str] = None
    file_type: Optional[str] = None

class DatasetSummary(BaseModel):
    dataset_id: str
    name: str
    upload_type: str
    timestamp: str

class UploadResponse(BaseModel):
    success: bool
    message: str
    files: List[str]

class SettingProfile(BaseModel):
    uid: str
    displayName: str
    about: str
    githubUrl: str
    photoURL: str

# Profile Models
class UserProfile(BaseModel):
    uid: str
    email: Optional[str] = None
    username: str
    name: Optional[str] = None
    bio: Optional[str] = "About me..."
    profilePicture: Optional[str] = None
    githubUrl: Optional[str] = None
    number_of_raw_datasets: int = 0
    number_of_vectorized_datasets: int = 0
    datasets: List[DatasetSummary] = Field(default_factory=list)