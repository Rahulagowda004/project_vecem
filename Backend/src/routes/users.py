from fastapi import APIRouter
from src.models.user import User

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
async def get_users():
    return {"message": "Get users endpoint"}

@router.get("/{user_id}")
async def get_user(user_id: int):
    return {"message": f"Get user {user_id} endpoint"}
