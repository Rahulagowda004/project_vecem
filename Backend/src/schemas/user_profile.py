from pydantic import BaseModel, Field
from typing import List, Optional

class Dataset(BaseModel):
    id: str
    name: str
    description: str

class UserProfile(BaseModel):
    email: str
    username: str
    name: Optional[str] = None
    bio: Optional[str] = None
    profilePicture: Optional[str] = None
    datasets: List[Dataset] = Field(default_factory=list)
