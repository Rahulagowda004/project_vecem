from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from config.settings import CORS_ORIGINS
from routes.upload_router import router as upload_router
from database.mongodb import close_db_client, user_profile_collection
from schemas.user_profile import UserProfile

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router)

@app.get("/")
async def root():
    return {"message": "File Upload API is running"}

class UserRequest(BaseModel):
    email: str
    username: str

@app.post("/register-user")
async def register_user(user_data: UserRequest):
    email = user_data.email
    username = user_data.username

    user_profile = UserProfile(email=email, username=username)
    user_profile_collection.insert_one(user_profile.dict())

    return {"message": "User registered successfully", "email": email}

# Shutdown event
@app.on_event("shutdown")
async def shutdown_db_client():
    await close_db_client()