from motor.motor_asyncio import AsyncIOMotorClient
from src.utils.logger import logging
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = "mongodb+srv://admin:8bx2pW7Dglj9j5RY@cluster0.tui77.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "vecem"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
user_profile_collection = db.userprofile
datasets_collection = db.datasets
deleted_datasets_collection = db.deleteddatasets
general_collection = db.general
issues_collection = db.issues
replies_collection = db.replies

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
        # dataset_summary = {
        #     "dataset_id": metadata["dataset_id"],
        #     "name": metadata["dataset_info"]["name"],
        #     "upload_type": metadata["upload_type"],
        #     "timestamp": metadata["timestamp"]
        # }
                

        update_result = await user_profile_collection.update_one(
            {"uid": uid},
            {
                # "$push": {"datasets": dataset_summary},
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
    
async def update_user_profile(uid: str, new_bio: str, new_profile_picture: str, new_name: str, new_github_url: str, new_username: str) -> bool:
    try:
        # Get current user profile
        current_profile = await user_profile_collection.find_one({"uid": uid})
        
        # Determine if this is the first username change
        set_has_changed = {}
        if current_profile and current_profile.get("username") != new_username:
            set_has_changed = {"hasChangedUsername": True}

        update_fields = {
            "bio": new_bio,
            "profilePicture": new_profile_picture,
            "name": new_name,
            "githubUrl": new_github_url,
            "username": new_username,
            **set_has_changed
        }

        result = await user_profile_collection.update_one(
            {"uid": uid},
            {"$set": update_fields}
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

async def delete_user_account(uid: str) -> bool:
    try:
        # Delete user profile
        profile_result = await user_profile_collection.delete_one({"uid": uid})
        
        # Delete all user datasets
        datasets_result = await datasets_collection.delete_many({"uid": uid})
        
        logging.info(f"Deleted user account {uid}: {profile_result.deleted_count} profile(s), {datasets_result.deleted_count} dataset(s)")
        
        return profile_result.deleted_count > 0
    except Exception as e:
        logging.error(f"MongoDB error during account deletion: {str(e)}")
        raise

async def save_api_key(uid: str, api_key: str) -> bool:
    try:
        result = await user_profile_collection.update_one(
            {"uid": uid},
            {"$set": {"api_key": api_key}},
            upsert=False
        )
        return result.modified_count > 0
    except Exception as e:
        logging.error(f"MongoDB error saving API key: {str(e)}")
        raise

async def check_api_key_exists(uid: str) -> bool:
    try:
        user = await user_profile_collection.find_one(
            {"uid": uid},
            {"api_key": 1}
        )
        return bool(user and user.get("api_key"))
    except Exception as e:
        logging.error(f"MongoDB error checking API key: {str(e)}")
        raise

async def close_db_client():
    client.close()
