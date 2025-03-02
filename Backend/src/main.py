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
from src.routes import users

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
app.include_router(users.router)

@app.get("/")
async def root():
    logging.info("Endpoint called: root()")
    return {"message": "File Upload API is running"}

def user_profile_serializer(user_profile):
    logging.info("Operation: user_profile_serializer()")
    user_profile["_id"] = str(user_profile["_id"])
    return user_profile

@app.post("/register-uid")
async def register_uid(uid_request: UidRequest):
    logging.info(f"Endpoint called: register_uid() with UID: {uid_request.uid}")
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
            await user_profile_collection.insert_one(new_user_profile.dict())
            logging.info(f"New user profile created for UID: {uid,email,name} with username: {username}")
            return jsonable_encoder(new_user_profile.dict())
    except Exception as e:
        CustomException(e,sys)

@app.get("/user-profile/{uid}")
async def get_user_profile(uid: str):
    logging.info(f"Endpoint called: get_user_profile() for UID: {uid}")
    try:
        user_profile = await user_profile_collection.find_one({"uid": uid})
        if user_profile:
            return jsonable_encoder(user_profile_serializer(user_profile))
        raise HTTPException(status_code=404, detail="User profile not found")
    except Exception as e:
        CustomException(e,sys)

@app.get("/user-profile/username/{username}")
async def get_user_profile_by_username(username: str):
    logging.info(f"Endpoint called: get_user_profile_by_username() for username: {username}")
    try:
        user_profile = await user_profile_collection.find_one({"username": username})
        if user_profile:
            return jsonable_encoder(user_profile_serializer(user_profile))
        raise HTTPException(status_code=404, detail="User profile not found")
    except Exception as e:
        CustomException(e,sys)

@app.get("/check-username/{username}")
async def check_username_availability(username: str):
    logging.info(f"Endpoint called: check_username_availability() for username: {username}")
    try:
        existing_user = await user_profile_collection.find_one({"username": username})
        return {"available": existing_user is None}
    except Exception as e:
        CustomException(e,sys)

@app.post("/update-profile")
async def update_profile(user: SettingProfile):
    logging.info(f"Endpoint called: update_profile() for UID: {user.uid}")
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
    logging.info(f"Endpoint called: delete_account() for UID: {uid}")
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
    logging.info(f"Endpoint called: log_dataset_click() for username: {data.get('username')}, dataset: {data.get('datasetName')}")
    try:
        username = data.get('username')
        dataset_name = data.get('datasetName')
        if not username or not dataset_name:
            raise ValueError("Username or datasetName is missing")
            
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
        dataset["username"] = username
        return jsonable_encoder(dataset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/dataset-edit-click")
async def log_dataset_edit(data: dict):
    logging.info(f"Endpoint called: log_dataset_edit() for UID: {data.get('uid')}, dataset: {data.get('datasetName')}")
    try:
        uid = data.get('uid')
        dataset_name = data.get('datasetName')
        
        if not uid or not dataset_name:
            raise ValueError("UID or datasetName is missing")
            
        dataset = await datasets_collection.find_one({
            "uid": uid,
            "dataset_info.name": dataset_name
        })
        
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        # Convert ObjectId to string for JSON serialization
        dataset["_id"] = str(dataset["_id"])
        
        # Log the edit action
        logging.info(f"Dataset edit clicked - UID: {uid}, Dataset: {dataset_name}")
        
        return jsonable_encoder(dataset)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/update-dataset/{dataset_id}")
async def update_dataset(dataset_id: str, updated_data: dict):
    logging.info(f"Endpoint called: update_dataset() for dataset_id: {dataset_id}")
    try:
        # Convert string ID back to ObjectId
        object_id = ObjectId(dataset_id)
        
        # Update the dataset
        result = await datasets_collection.update_one(
            {"_id": object_id},
            {"$set": {
                "dataset_info.name": updated_data.get("name"),
                "dataset_info.description": updated_data.get("description"),
                "dataset_info.domain": updated_data.get("domain"),
                "dataset_info.file_type": updated_data.get("fileType"),
                "upload_type": updated_data.get("datasetType"),
                "vectorized_settings": updated_data.get("vectorizedSettings"),
            }}
        )
        logging.info(f"Dataset updated: {result} in update_dataset()")
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        return {"message": "Dataset updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-avatar/{uid}")
async def get_user_avatar(uid: str):
    logging.info(f"Endpoint called: get_user_avatar() for UID: {uid}")
    try:
        user_profile = await user_profile_collection.find_one(
            {"uid": uid}, 
            {"profilePicture": 1}
        )
        logging.info(f"User profile: {user_profile}")
        if user_profile and "profilePicture" in user_profile:
            return {"avatar": user_profile["profilePicture"]}
        return {"avatar": None}
    except Exception as e:
        CustomException(e,sys)

@app.get("/check-dataset-name/{uid}/{dataset_name}")
async def check_dataset_name_availability(uid: str, dataset_name: str):
    logging.info(f"Endpoint called: check_dataset_name_availability() for UID: {uid}, dataset name: {dataset_name}")
    try:
        # Check if dataset name exists for this user
        existing_dataset = await datasets_collection.find_one({
            "uid": uid,
            "dataset_info.name": dataset_name
        })
        return {
            "available": existing_dataset is None,
            "message": "Dataset name already exists" if existing_dataset else "Dataset name available"
        }
    except Exception as e:
        CustomException(e, sys)

# Shutdown event
@app.on_event("shutdown")
async def shutdown_db_client():
    logging.info("Operation: shutdown_db_client()")
    await close_db_client()