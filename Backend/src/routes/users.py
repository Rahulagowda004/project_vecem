from fastapi import APIRouter, HTTPException
from src.models.models import User, UserProfile
from src.database.mongodb import user_profile_collection, datasets_collection

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
async def get_users():
    return {"message": "Get users endpoint"}

@router.get("/{user_id}")
async def get_user(user_id: int):
    return {"message": f"Get user {user_id} endpoint"}

@router.get("/{username}")
async def get_user_by_username(username: str):
    user = await user_profile_collection.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return user

@router.get("/{username}/datasets")
async def get_user_datasets(username: str):
    user = await user_profile_collection.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    datasets = await datasets_collection.find({"uid": user["uid"]}).to_list(None)
    return [{"_id": str(dataset["_id"]), **dataset} for dataset in datasets]

@router.get("/{username}/{dataset_name}")
async def get_dataset_by_name(username: str, dataset_name: str):
    user = await user_profile_collection.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    dataset = await datasets_collection.find_one({
        "uid": user["uid"],
        "dataset_info.name": dataset_name
    })
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    dataset["_id"] = str(dataset["_id"])
    return dataset
