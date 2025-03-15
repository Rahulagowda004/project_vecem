from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from starlette.status import HTTP_401_UNAUTHORIZED
import secrets
from typing import Dict, List
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
from src.database.mongodb import (
    user_profile_collection,
    datasets_collection,
    prompts_collection
)

router = APIRouter(prefix="/admin", tags=["admin"])
security = HTTPBasic()

ADMIN_USERNAME = "vecem"
ADMIN_PASSWORD = "Vecem@123"

async def verify_admin(credentials: HTTPBasicCredentials = Depends(security)) -> bool:
    is_username_correct = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    is_password_correct = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    
    if not (is_username_correct and is_password_correct):
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return True

@router.get("/dashboard", dependencies=[Depends(verify_admin)])
async def get_dashboard_stats():
    users_count = await user_profile_collection.count_documents({})
    datasets_count = await datasets_collection.count_documents({})
    prompts_count = await prompts_collection.count_documents({})
    
    return {
        "users_count": users_count,
        "datasets_count": datasets_count,
        "prompts_count": prompts_count,
        "last_updated": datetime.utcnow().isoformat()
    }

@router.get("/users", dependencies=[Depends(verify_admin)])
async def get_users():
    users = await user_profile_collection.find().to_list(length=None)
    return [{"id": str(user["_id"]), **{k: v for k, v in user.items() if k != "_id"}} for user in users]

@router.get("/datasets", dependencies=[Depends(verify_admin)])
async def get_datasets():
    try:
        datasets = await datasets_collection.find({}).to_list(length=None)
        formatted_datasets = []
        
        for dataset in datasets:
            # Get user profile to get the username
            user = await user_profile_collection.find_one({"uid": dataset.get("uid")})
            username = user.get("username", "Unknown") if user else "Unknown"
            
            formatted_datasets.append({
                "id": str(dataset["_id"]),
                "name": dataset.get("dataset_info", {}).get("name", "Untitled"),
                "description": dataset.get("dataset_info", {}).get("description", ""),
                "upload_type": dataset.get("upload_type", "unknown"),
                "owner": username,  # Now using username instead of full name
                "createdAt": dataset.get("timestamp", ""),
            })
        return formatted_datasets
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/prompts", dependencies=[Depends(verify_admin)])
async def get_prompts():
    try:
        prompts = await prompts_collection.find({}).to_list(length=None)
        return [
            {
                "id": str(prompt["_id"]),
                "name": prompt.get("prompt_name", "Untitled"),
                "domain": prompt.get("domain", "General"),
                "username": prompt.get("username", "Unknown"),
                "createdAt": prompt.get("createdAt", ""),
            }
            for prompt in prompts
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/datasets/{dataset_id}", dependencies=[Depends(verify_admin)])
async def delete_dataset(dataset_id: str):
    try:
        result = await datasets_collection.delete_one({"_id": ObjectId(dataset_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Dataset not found")
        return {"message": "Dataset deleted successfully"}
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid dataset ID")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/prompts/{prompt_id}", dependencies=[Depends(verify_admin)])
async def delete_prompt(prompt_id: str):
    try:
        result = await prompts_collection.delete_one({"_id": ObjectId(prompt_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Prompt not found")
        return {"message": "Prompt deleted successfully"}
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid prompt ID")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
