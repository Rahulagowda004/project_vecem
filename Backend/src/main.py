import sys
import uuid
import base64
from bson import ObjectId
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.routes.upload_router import router as upload_router
from src.database.mongodb import close_db_client, user_profile_collection, update_user_profile,datasets_collection, delete_user_account
from src.models.models import UserProfile,UidRequest,SettingProfile
from fastapi.encoders import jsonable_encoder
from src.utils.exception import CustomException
from src.utils.logger import logging

app = FastAPI()

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

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

def user_profile_serializer(user_profile):
    user_profile["_id"] = str(user_profile["_id"])
    return user_profile

@app.post("/register-uid")
async def register_uid(uid_request: UidRequest):
    try:
        uid = uid_request.uid
        email = uid_request.email
        name = uid_request.name
        user_profile = await user_profile_collection.find_one({"uid": uid})
        if user_profile:
            logging.info("User profile exists for UID: {uid, email,name}")
            return jsonable_encoder(user_profile_serializer(user_profile))
        else:
            unique_id = str("vecem" + base64.urlsafe_b64encode(uuid.uuid4().bytes).decode('utf-8').rstrip('=\n')[:6])
            username = f"{name.replace(' ', '')}{unique_id}"
            
            new_user_profile = UserProfile(
                uid=uid, 
                email=email,
                name=name,
                username=username,
                hasChangedUsername=False
            )
            user_profile_collection.insert_one(new_user_profile.dict())
            logging.info(f"New user profile created for UID: {uid,email,name} with username: {username}")
            return jsonable_encoder(new_user_profile.dict())
    except Exception as e:
        CustomException(e,sys)

@app.get("/user-profile/{uid}")
async def get_user_profile(uid: str):
    try:
        user_profile = await user_profile_collection.find_one({"uid": uid})
        if user_profile:
            return jsonable_encoder(user_profile_serializer(user_profile))
        raise HTTPException(status_code=404, detail="User profile not found")
    except Exception as e:
        CustomException(e,sys)

@app.get("/user-profile/username/{username}")
async def get_user_profile_by_username(username: str):
    try:
        user_profile = await user_profile_collection.find_one({"username": username})
        if user_profile:
            return jsonable_encoder(user_profile_serializer(user_profile))
        raise HTTPException(status_code=404, detail="User profile not found")
    except Exception as e:
        CustomException(e,sys)

@app.get("/check-username/{username}")
async def check_username_availability(username: str):
    try:
        existing_user = await user_profile_collection.find_one({"username": username})
        return {"available": existing_user is None}
    except Exception as e:
        CustomException(e,sys)

@app.post("/update-profile")
async def update_profile(user: SettingProfile):
    try:
        # Check if username is already taken (if username is being changed)
        existing_user = await user_profile_collection.find_one({"username": user.username, "uid": {"$ne": user.uid}})
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already taken")

        success = await update_user_profile(
            uid=user.uid,
            new_bio=user.about,
            new_profile_picture=user.photoURL,
            new_name=user.displayName,
            new_github_url=user.githubUrl,
            new_username=user.username
        )
        if success:
            logging.info(f"Profile updated successfully for UID: {user.uid}")
            return {"message": "Profile updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="User profile not found")
    except HTTPException as he:
        raise he
    except Exception as e:
        CustomException(e,sys)

@app.delete("/delete-account/{uid}")
async def delete_account(uid: str):
    try:
        # Delete user account from database
        success = await delete_user_account(uid)
        
        if not success:
            raise HTTPException(status_code=404, detail="User profile not found")
            
        return {"message": "Account deleted successfully"}
    except Exception as e:
        CustomException(e,sys)

@app.post("/dataset-click")
async def log_dataset_click(data: dict):
    try:
        uid = data.get('uid')
        dataset_name = data.get('datasetName')
        if not uid or not dataset_name:
            raise ValueError("UID or datasetName is missing")
        dataset = await datasets_collection.find_one(
            {"uid": uid, "dataset_info.name": dataset_name}
        )
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        # Convert ObjectId to string
        dataset["_id"] = str(dataset["_id"])
        return jsonable_encoder(dataset)
    except Exception as e:
        print(f"Error: {e}")  
        raise HTTPException(status_code=500, detail=str(e))

# Shutdown event
@app.on_event("shutdown")
async def shutdown_db_client():
    await close_db_client()