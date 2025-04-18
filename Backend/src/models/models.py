from pydantic import BaseModel, Field
from typing import List, Optional

# User Models
class User(BaseModel):
    uid: str
    email: str
    username: str = Field(..., description="Auto-generated unique username")
    name: Optional[str] = None
    hasChangedUsername: bool = False

class UidRequest(BaseModel):
    uid: str
    email: str
    name: str

class VectorizedSettings(BaseModel):
    dimensions: Optional[int] = None
    vector_database: Optional[str] = None
    model_name: Optional[str] = None

class DatasetInfo(BaseModel):
    name: str
    description: str
    domain: str
    file_type: str
    datasetId: Optional[str] = None
    uid: Optional[str] = None
    license: Optional[str] = None
    isEdit: Optional[bool] = False

class DatasetEditInfo(BaseModel):
    name: str
    description: str
    domain: str
    file_type: str
    datasetId: str
    isEdit: bool = True

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
    username: str

#prompts Models
class Prompts(BaseModel):
    username: str
    prompt_name: str
    prompt: str
    domain: str

# Profile Models
class UserProfile(BaseModel):
    uid: str
    email: Optional[str] = None
    username: str
    name: Optional[str] = None
    api_key: str = None
    bio: Optional[str] = "About me..."
    profilePicture: str | None = Field(default="/avatars/avatar1.png")
    githubUrl: Optional[str] = None
    hasChangedUsername: bool = False
    number_of_raw_datasets: int = 0
    number_of_vectorized_datasets: int = 0
    # datasets: List[DatasetSummary] = Field(default_factory=list)