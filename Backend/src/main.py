import sys
import uuid
import base64
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.routes.upload_router import router as upload_router
from src.database.mongodb import close_db_client, user_profile_collection, update_user_profile
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
                username=username
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

@app.post("/update-profile")
async def update_profile(user: SettingProfile):
    try:
        success = await update_user_profile(
            uid=user.uid,
            new_bio=user.about,
            new_profile_picture=user.photoURL,
            new_name=user.displayName,
            new_github_url=user.githubUrl
        )
        if success:
            logging.info(f"Profile updated successfully for UID: {user.uid}")
            return {"message": "Profile updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="User profile not found")
    except Exception as e:
        CustomException(e,sys)

@app.delete("/delete-account/{uid}")
async def delete_account(uid: str):
    try:
        # Delete user profile from database
        result = await user_profile_collection.delete_one({"uid": uid})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User profile not found")
            
        # Delete associated datasets
        await dataset_collection.delete_many({"owner": uid})
        
        return {"message": "Account deleted successfully"}
    except Exception as e:
        CustomException(e,sys)

# Shutdown event
@app.on_event("shutdown")
async def shutdown_db_client():
    await close_db_client()