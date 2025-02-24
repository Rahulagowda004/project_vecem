from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.routes.upload_router import router as upload_router
from src.database.mongodb import close_db_client, user_profile_collection, update_user_profile
from src.models.models import UserProfile,UidRequest,UserRequest,SettingProfile
from fastapi.encoders import jsonable_encoder
from bson import ObjectId

app = FastAPI()

CORS_ORIGINS = [
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:5173",
    "http://localhost:3000",  # In case you use a different port
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

@app.post("/register-user")
async def register_user(user_data: UserRequest):
    uid = user_data.uid
    email = user_data.email
    username = user_data.username
    user_profile = UserProfile(uid=uid, email=email, username=username)
    user_profile_collection.insert_one(user_profile.dict())
    return {"message": "User registered successfully", "email": email}

def user_profile_serializer(user_profile):
    user_profile["_id"] = str(user_profile["_id"])
    return user_profile

@app.post("/register-uid")
async def register_uid(uid_request: UidRequest):
    uid = uid_request.uid
    email = uid_request.email
    name = uid_request.name
    user_profile = await user_profile_collection.find_one({"uid": uid})

    if user_profile:
        print(f"User profile found for UID: {uid, email,name}")
        return jsonable_encoder(user_profile_serializer(user_profile))
    else:
        new_user_profile = UserProfile(uid=uid, email=email,name = name)
        user_profile_collection.insert_one(new_user_profile.dict())
        print(f"New user profile created for UID: {uid,email,name}")
        return jsonable_encoder(new_user_profile.dict())

@app.get("/user-profile/{uid}")
async def get_user_profile(uid: str):
    user_profile = await user_profile_collection.find_one({"uid": uid})
    if user_profile:
        return jsonable_encoder(user_profile_serializer(user_profile))
    raise HTTPException(status_code=404, detail="User profile not found")

@app.post("/update-profile")
async def update_profile(user: SettingProfile):
    success = await update_user_profile(
        uid=user.uid,
        new_bio=user.about,
        new_profile_picture=user.photoURL,
        new_name=user.displayName,
        new_github_url=user.githubUrl
    )
    if success:
        print("Received user update:")
        print(f"UID: {user.uid}")
        print(f"Display Name: {user.displayName}")
        print(f"About: {user.about}")
        print(f"GitHub URL: {user.githubUrl}")
        print(f"Photo URL: {user.photoURL}")
        return {"message": "Profile updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="User profile not found")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_db_client():
    await close_db_client()