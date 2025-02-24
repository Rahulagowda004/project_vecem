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
