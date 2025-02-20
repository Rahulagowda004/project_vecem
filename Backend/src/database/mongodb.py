from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import MONGO_URL, DB_NAME, logger

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
datasets_collection = db.datasets

async def save_to_mongodb(metadata: dict) -> str:
    try:
        result = await datasets_collection.insert_one(metadata)
        logger.info(f"Saved to MongoDB with ID: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        logger.error(f"MongoDB error: {str(e)}")
        raise

async def close_db_client():
    client.close()
