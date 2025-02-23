from pydantic import BaseModel, Field
from typing import List, Optional

# User Models
class User(BaseModel):
    uid: str
    email: str
    username: str

class UserRequest(BaseModel):
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

# Profile Models
class UserProfile(BaseModel):
    uid: str
    email: str
    name: Optional[str] = None
    bio: Optional[str] = None
    profilePicture: Optional[str] = None
    datasets: List[DatasetInfo] = Field(default_factory=list)
