import os
import sys
from typing import Optional
from dotenv import load_dotenv
from pydantic import BaseModel
from utils.exception import CustomException
from utils.logger import logging
from fastapi.middleware.cors import CORSMiddleware
from authlib.integrations.starlette_client import OAuth
from fastapi import FastAPI, Depends, HTTPException,Request

app = FastAPI()
load_dotenv()

# CORS settings
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth0 configuration
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_IDENTIFIER = os.getenv("API_IDENTIFIER")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

oauth = OAuth()

oauth.register(
    "auth0",
    client_id=os.getenv("CLIENT_ID"),
    client_secret=os.getenv("CLIENT_SECRET"),
    client_kwargs={
        "scope": "openid profile email",
    },
    server_metadata_url=f'https://{os.getenv("AUTH0_DOMAIN")}/.well-known/openid-configuration'
)

# Pydantic models
class UserProfile(BaseModel):
    username: str
    email: str
    about_me: Optional[str] = None

# In-memory database simulation
fake_db = {
    "user1": {
        "username": "Benhur",
        "email": "vector@gmail.com",
        "about_me": "A Lead UX & UI designer based in Canada"
    }
}

# Dependency to get the current user
async def get_current_user(request: Request):
    try:
        # Get the token from the callback
        token = await oauth.auth0.authorize_access_token(request)
        # Call the userinfo endpoint with the token
        resp = await oauth.auth0.get("userinfo", token=token)
        user_info = await resp.json()
        logging.info(f"User info: {user_info}")
        return user_info
    except Exception as e:
        logging.error(f"Error: {CustomException(e,sys)}")
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/profile", response_model=UserProfile)
async def read_profile(user: dict = Depends(get_current_user)):
    user_id = user['sub']
    if user_id in fake_db:
        return fake_db[user_id]
    raise HTTPException(status_code=404, detail="User not found")

@app.put("/profile", response_model=UserProfile)
async def update_profile(profile: UserProfile, user: dict = Depends(get_current_user)):
    user_id = user['sub']
    if user_id in fake_db:
        fake_db[user_id] = profile.dict()
        return profile
    raise HTTPException(status_code=404, detail="User not found")

logging.info("Server started successfully")
