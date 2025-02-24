from pydantic import BaseModel, Field
from typing import List, Optional

# User Models
class User(BaseModel):
    uid: str
    email: str
    username: str

class UidRequest(BaseModel):
    uid: str
    email: str
    name: str

class DatasetInfo(BaseModel):
    name: str
    description: Optional[str] = None
    datasetId: Optional[str] = None

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
    email: str
    name: Optional[str] = None
    bio: Optional[str] = "About me..."
    profilePicture: Optional[str] = None
    githubUrl: Optional[str] = None
    number_of_raw_datasets: Optional[int] = 0
    number_of_vectorized_datasets: Optional[int] = 0
    datasets: List[DatasetInfo] = Field(default_factory=list)