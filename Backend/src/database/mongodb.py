from motor.motor_asyncio import AsyncIOMotorClient
from src.utils.logger import logging
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL")
DB_NAME = os.getenv("MONGODB_NAME")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
user_profile_collection = db.userprofile
datasets_collection = db.datasets

async def save_userprofile(userprofile: dict) -> str:
    try:
        result = await user_profile_collection.insert_one(userprofile)
        logging.info(f"Saved to MongoDB with ID: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        logging.error(f"MongoDB error: {str(e)}")
        raise

async def save_metadata(metadata: dict) -> str:
    try:
        result = await datasets_collection.insert_one(metadata)
        logging.info(f"Saved to MongoDB with ID: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        logging.error(f"MongoDB error: {str(e)}")
        raise

async def save_metadata_and_update_user(metadata: dict) -> str:
    try:
        # Save to datasets collection
        dataset_id = await save_metadata(metadata)
        
        # Update user profile with dataset reference
        uid = metadata["uid"]
        dataset_summary = {
            "dataset_id": metadata["dataset_id"],
            "name": metadata["dataset_info"]["name"],
            "upload_type": metadata["upload_type"],
            "timestamp": metadata["timestamp"]
        }
        
        update_result = await user_profile_collection.update_one(
            {"uid": uid},
            {
                "$push": {"datasets": dataset_summary},
                "$inc": {
                    "number_of_raw_datasets": 1 if metadata["upload_type"] in ["raw", "both"] else 0,
                    "number_of_vectorized_datasets": 1 if metadata["upload_type"] in ["vectorized", "both"] else 0
                }
            },
            upsert=True
        )
        
        logging.info(f"Updated user profile for UID {uid} with dataset {dataset_id}")
        return dataset_id
    except Exception as e:
        logging.error(f"MongoDB error: {str(e)}")
        raise

async def update_user_profile(uid: str, new_bio: str, new_profile_picture: str, new_name: str, new_github_url: str) -> bool:
    try:
        result = await user_profile_collection.update_one(
            {"uid": uid},
            {
                "$set": {
                    "bio": new_bio,
                    "profilePicture": new_profile_picture,
                    "name": new_name,
                    "githubUrl": new_github_url
                }
            }
        )
        if result.modified_count > 0:
            logging.info(f"User profile updated for UID: {uid}")
            return True
        else:
            logging.warning(f"No user profile found for UID: {uid}")
            return False
    except Exception as e:
        logging.error(f"MongoDB error: {str(e)}")
        raise

async def close_db_client():
    client.close()
