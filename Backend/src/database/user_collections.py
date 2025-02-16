from datetime import datetime
from bson import ObjectId
from typing import Dict, Union, Optional, List

class UserModel:
    def __init__(self, username: str, email: str):
        self._id = ObjectId()
        self.username = username
        self.email = email
        self.created_at = datetime.utcnow()

    def validate(self) -> bool:
        if not self.username or not isinstance(self.username, str):
            raise ValueError("Username is required and must be a string")
        if not self.email or not isinstance(self.email, str):
            raise ValueError("Email is required and must be a string")
        return True

    def to_dict(self) -> Dict[str, Union[str, datetime]]:
        return {
            "_id": self._id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at
        }

class DatasetModel:
    def __init__(self, 
                 user_id: str,
                 dataset_category: str,
                 media_type: str,
                 about_data: str,
                 dims: Dict[str, int],
                 file_url: str):
        self._id = ObjectId()
        self.user_id = ObjectId(user_id)
        self.dataset_category = dataset_category
        self.media_type = media_type
        self.about_data = about_data
        self.dims = dims
        self.file_url = file_url
        self.uploaded_at = datetime.utcnow()

    @property
    def valid_categories(self) -> List[str]:
        return ["rdata", "vdata"]

    @property
    def valid_media_types(self) -> List[str]:
        return ["image", "audio", "video", "text"]

    def validate(self) -> bool:
        if self.dataset_category not in self.valid_categories:
            raise ValueError(f"Invalid category. Must be one of {self.valid_categories}")
        if self.media_type not in self.valid_media_types:
            raise ValueError(f"Invalid media type. Must be one of {self.valid_media_types}")
        if not isinstance(self.dims, dict):
            raise ValueError("Dimensions must be a dictionary")
        return True

    def to_dict(self) -> Dict[str, Union[str, dict, datetime]]:
        return {
            "_id": self._id,
            "user_id": self.user_id,
            "dataset_category": self.dataset_category,
            "media_type": self.media_type,
            "about_data": self.about_data,
            "dims": self.dims,
            "file_url": self.file_url,
            "uploaded_at": self.uploaded_at
        }