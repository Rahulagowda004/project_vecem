from fastapi import APIRouter, HTTPException
from ..models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login():
    return {"message": "Login endpoint"}

@router.post("/register")
async def register(user: User):
    return {"message": "Register endpoint"}
