from motor.motor_asyncio import AsyncIOMotorClient
from src.config.settings import logger

MONGO_URL = "mongodb+srv://admin:8bx2pW7Dglj9j5RY@cluster0.tui77.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "vecem"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
user_profile_collection = db.userprofile
datasets_collection = db.datasets

async def save_userprofile(userprofile: dict) -> str:
    try:
        result = await user_profile_collection.insert_one(userprofile)
        logger.info(f"Saved to MongoDB with ID: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        logger.error(f"MongoDB error: {str(e)}")
        raise

async def save_metadata(metadata: dict) -> str:
    try:
        result = await datasets_collection.insert_one(metadata)
        logger.info(f"Saved to MongoDB with ID: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        logger.error(f"MongoDB error: {str(e)}")
        raise

async def close_db_client():
    client.close()
