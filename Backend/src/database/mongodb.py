from motor.motor_asyncio import AsyncIOMotorClient
from src.utils.logger import logging

MONGO_URL = "mongodb+srv://admin:8bx2pW7Dglj9j5RY@cluster0.tui77.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "vecem"

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

async def get_user_datasets(uid: str):
    try:
        datasets = await datasets_collection.find({"uid": uid}).to_list(length=None)
        return [{
            "id": str(dataset["_id"]),
            "name": dataset["dataset_info"]["name"],
            "description": dataset["dataset_info"].get("description", ""),
            "visibility": "public",  # You can add this field to your schema
            "updatedAt": dataset["timestamp"],
            "createdAt": dataset["timestamp"],
            "size": len(dataset.get("files", {}).get("raw", [])) + len(dataset.get("files", {}).get("vectorized", [])),
            "format": dataset["upload_type"],
            "owner": uid
        } for dataset in datasets]
    except Exception as e:
        logging.error(f"Error fetching user datasets: {str(e)}")
        return []

async def close_db_client():
    client.close()
