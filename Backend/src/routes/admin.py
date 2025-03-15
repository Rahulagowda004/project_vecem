from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from starlette.status import HTTP_401_UNAUTHORIZED
import secrets
from typing import Dict, List
from datetime import datetime
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
    datasets = await datasets_collection.find().to_list(length=None)
    return [{"id": str(dataset["_id"]), **{k: v for k, v in dataset.items() if k != "_id"}} for dataset in datasets]

@router.get("/prompts", dependencies=[Depends(verify_admin)])
async def get_prompts():
    prompts = await prompts_collection.find().to_list(length=None)
    return [{"id": str(prompt["_id"]), **{k: v for k, v in prompt.items() if k != "_id"}} for prompt in prompts]
