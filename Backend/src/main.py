import sys
import uuid
import base64
from datetime import datetime, timedelta
import pytz
from bson import ObjectId
from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.routes.upload_router import router as upload_router
from src.database.mongodb import close_db_client, user_profile_collection, update_user_profile,datasets_collection, delete_user_account,deleted_datasets_collection,replies_collection,issues_collection,general_collection,prompts_collection
from src.models.models import UserProfile,UidRequest,SettingProfile,Prompts
from fastapi.encoders import jsonable_encoder
from src.utils.exception import CustomException
from src.utils.logger import logging
from src.routes import users
from src.bot import FRIDAY
from typing import Optional 
from src.models.chat_models import General, Issue, IssueReply
from src.database import mongodb

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
        if not user_profile:
            raise HTTPException(status_code=404, detail="User profile not found")

        # Get user's datasets
        datasets = await datasets_collection.find(
            {"uid": uid},
            {
                "dataset_id": 1,
                "dataset_info.name": 1,
                "dataset_info.description": 1,
                "upload_type": 1,
                "timestamp": 1
            }
        ).to_list(None)

        # Get user's prompts
        prompts = await prompts_collection.find(
            {"username": user_profile["username"]}
        ).to_list(None)

        # Format datasets
        formatted_datasets = [
            {
                "id": str(dataset["_id"]),
                "name": dataset.get("dataset_info", {}).get("name", "Untitled"),
                "description": dataset.get("dataset_info", {}).get("description", ""),
                "upload_type": dataset.get("upload_type", "unknown"),
                "updatedAt": dataset.get("timestamp", ""),
                "timestamp": dataset.get("timestamp", "")
            }
            for dataset in datasets
        ]

        # Format prompts
        formatted_prompts = [
            {
                "id": str(prompt["_id"]),
                "name": prompt.get("prompt_name", "Untitled"),
                "description": prompt.get("description", ""),
                "domain": prompt.get("domain", "General"),
                "prompt": prompt.get("prompt", ""),
                "createdAt": prompt.get("createdAt", ""),
                "updatedAt": prompt.get("updatedAt", prompt.get("createdAt", ""))
            }
            for prompt in prompts
        ]

        # Add datasets and prompts to user profile
        user_profile_data = user_profile_serializer(user_profile)
        user_profile_data["datasets"] = formatted_datasets
        user_profile_data["prompts"] = formatted_prompts

        return jsonable_encoder(user_profile_data)
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error(f"Error in get_user_profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-profile/username/{username}")
async def get_user_profile_by_username(username: str):
    logging.info(f"Endpoint called: get_user_profile_by_username() for username: {username}")
    try:
        user_profile = await user_profile_collection.find_one({"username": username})
        if not user_profile:
            raise HTTPException(status_code=404, detail="User profile not found")

        # Get user's datasets
        datasets = await datasets_collection.find(
            {"uid": user_profile["uid"]}
        ).to_list(None)

        # Get user's prompts
        prompts = await prompts_collection.find(
            {"username": username}
        ).to_list(None)

        # Format datasets
        formatted_datasets = [
            {
                "id": str(dataset["_id"]),
                "name": dataset.get("dataset_info", {}).get("name", "Untitled"),
                "description": dataset.get("dataset_info", {}).get("description", ""),
                "upload_type": dataset.get("upload_type", "unknown"),
                "updatedAt": dataset.get("timestamp", ""),
                "timestamp": dataset.get("timestamp", "")
            }
            for dataset in datasets
        ]

        # Format prompts
        formatted_prompts = [
            {
                "id": str(prompt["_id"]),
                "name": prompt.get("prompt_name", "Untitled"),
                "description": prompt.get("description", ""),
                "domain": prompt.get("domain", "General"),
                "prompt": prompt.get("prompt", ""),
                "createdAt": prompt.get("createdAt", ""),
                "updatedAt": prompt.get("updatedAt", prompt.get("createdAt", ""))
            }
            for prompt in prompts
        ]

        # Add datasets and prompts to user profile
        user_profile_data = user_profile_serializer(user_profile)
        user_profile_data["datasets"] = formatted_datasets
        user_profile_data["prompts"] = formatted_prompts

        return jsonable_encoder(user_profile_data)

    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error(f"Error in get_user_profile_by_username: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/check-username/{username}")
async def check_username_availability(username: str):
    logging.info(f"Endpoint called: check_username_availability() for username: {username}")
    try:
        existing_user = await user_profile_collection.find_one({"username": username})
        return {"available": existing_user is None}
    except Exception as e:
        CustomException(e,sys)

class SettingProfile(BaseModel):
    uid: str
    displayName: Optional[str]
    username: str
    about: Optional[str]
    photoURL: Optional[str]
    githubUrl: Optional[str]
    hasChangedUsername: Optional[bool]
    apiKey: Optional[str]  # Add API key field

@app.post("/update-profile")
async def update_profile(user: SettingProfile):
    logging.info(f"Endpoint called: update_profile() for UID: {user.uid}")
    try:
        # Check if username is already taken (if username is being changed)
        existing_user = await user_profile_collection.find_one({"username": user.username, "uid": {"$ne": user.uid}})
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already taken")

        # Update document directly
        update_result = await user_profile_collection.update_one(
            {"uid": user.uid},
            {"$set": {
                "name": user.displayName,
                "bio": user.about,
                "profilePicture": user.photoURL,
                "githubUrl": user.githubUrl,
                "username": user.username,
                "hasChangedUsername": user.hasChangedUsername,
                "api_key": user.apiKey  # Add API key update
            }}
        )

        if update_result.modified_count > 0:
            logging.info(f"Profile updated successfully for UID: {user.uid}")
            return {"message": "Profile updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="User profile not found")
    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error(f"Error updating profile: {str(e)}")
        CustomException(e, sys)

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
        dataset["username"] = username  # Add username to the response
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

class DatasetDeleteRequest(BaseModel):
    userId: str
    datasetName: str = None

@app.delete("/api/datasets/{dataset_id}")
async def delete_dataset(dataset_id: str, delete_req: DatasetDeleteRequest = Body(...)):
    logging.info(f"Endpoint called: delete_dataset() for dataset_id: {dataset_id}")
    try:
        # Extract data from request body
        uid = delete_req.userId
        dataset_name = delete_req.datasetName
        
        logging.info(f"Dataset deletion requested - UserID: {uid}, Dataset Name: {dataset_name}")
        
        # Convert string ID to ObjectId
        try:
            object_id = ObjectId(dataset_id)
        except Exception as e:
            logging.error(f"Invalid ObjectId format: {dataset_id} - {str(e)}")
            raise HTTPException(status_code=400, detail=f"Invalid dataset ID format: {dataset_id}")
        
        # Find the dataset document first
        dataset_doc = await datasets_collection.find_one({"_id": object_id, "uid": uid})
        
        if not dataset_doc:
            logging.error(f"Dataset not found with _id: {object_id} and uid: {uid}")
            raise HTTPException(status_code=404, detail="Dataset not found or you don't have permission to delete it")
            
        # Mark the document as deleted
        dataset_doc["deleted_at"] = datetime.now()

        # Insert into deleted_datasets collection
        await deleted_datasets_collection.insert_one(dataset_doc)
        logging.info(f"Dataset added to deleted_datasets_collection")

        # Delete from original collection
        result = await datasets_collection.delete_one({"_id": object_id})
        
        if result.deleted_count == 0:
            logging.error(f"Failed to delete dataset from collection")
            raise HTTPException(status_code=500, detail="Failed to delete dataset")
            
        logging.info(f"Dataset successfully deleted - UserID: {uid}, Dataset Name: {dataset_name}")
        return {"message": "Dataset deleted successfully"}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error(f"Error deleting dataset: {str(e)}")
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

@app.post("/dataset-category")
async def log_dataset_category(data: dict):
    logging.info(f"Endpoint called: log_dataset_category() for category: {data.get('category')}")
    try:
        category = data.get('category')
        if not category:
            raise ValueError("Category is missing")

        # Base query
        query = {}
        if category != "all":
            query["dataset_info.file_type"] = category

        # Fetch 16 most recent datasets
        datasets = await datasets_collection.find(query).sort("timestamp", -1).limit(16).to_list(None)
        
        # Process datasets
        processed_datasets = []
        for dataset in datasets:
            dataset["_id"] = str(dataset["_id"])
            if "dataset_info" not in dataset:
                dataset["dataset_info"] = {}
            dataset["dataset_info"]["file_type"] = dataset.get("dataset_info", {}).get("file_type", "unknown")
            dataset["dataset_info"]["name"] = dataset.get("dataset_info", {}).get("name", "Untitled")
            dataset["dataset_info"]["description"] = dataset.get("dataset_info", {}).get("description", "")
            dataset["dataset_info"]["domain"] = dataset.get("dataset_info", {}).get("domain", "")
            processed_datasets.append(dataset)

        return {
            "status": "success",
            "message": f"Category {category} selected",
            "category": category,
            "datasets": jsonable_encoder(processed_datasets)
        }
    except Exception as e:
        logging.error(f"Error in log_dataset_category: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/community/general")
async def create_general_message(message: dict):
    try:
        ist = pytz.timezone('Asia/Kolkata')
        message_doc = {
            "title": message.get("title"),
            "description": message.get("description"),
            "uid": message.get("uid"),
            "created_at": datetime.now(ist).strftime('%Y-%m-%d %H:%M:%S %Z')
        }
        result = await general_collection.insert_one(message_doc)
        message_id = str(result.inserted_id)
        return {"id": message_id, "status": "success"}
    except Exception as e:
        logging.error(f"Error creating general message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/community/issue")
async def create_issue_message(message: dict):
    try:
        ist = pytz.timezone('Asia/Kolkata')
        message_doc = {
            "title": message.get("title"),
            "description": message.get("description"),
            "uid": message.get("uid"),
            "created_at": datetime.now(ist).strftime('%Y-%m-%d %H:%M:%S %Z')
        }
        result = await issues_collection.insert_one(message_doc)
        message_id = str(result.inserted_id)
        return {"id": message_id, "status": "success"}
    except Exception as e:
        logging.error(f"Error creating issue message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/community/reply")
async def create_reply_message(message: dict):
    try:
        ist = pytz.timezone('Asia/Kolkata')
        message_doc = {
            "issue_id": message.get("issue_id"),
            "title": message.get("title"),
            "description": message.get("description"),
            "uid": message.get("uid"),
            "created_at": datetime.now(ist).strftime('%Y-%m-%d %H:%M:%S %Z')
        }
        result = await replies_collection.insert_one(message_doc)
        message_id = str(result.inserted_id)
        return {"id": message_id, "status": "success"}
    except Exception as e:
        logging.error(f"Error creating reply message: {str(e)}")
        raise HTTPException(status_code=500, detail=[str(e)])
        
@app.get("/community/messages/{tag}")
async def get_messages(tag: str):
    try:
        collection = general_collection if tag == "general" else issues_collection
        messages = await collection.find({}).sort("created_at", 1).to_list(None)
        
        ist = pytz.timezone('Asia/Kolkata')
        processed_messages = []
        for msg in messages:
            user = await user_profile_collection.find_one({"uid": msg["uid"]})
            
            # Get replies for issues
            replies = []
            if tag == "issue":
                replies_cursor = await replies_collection.find(
                    {"issue_id": str(msg["_id"])}
                ).sort("created_at", 1).to_list(None)
                
                for reply in replies_cursor:
                    reply_user = await user_profile_collection.find_one({"uid": reply["uid"]})
                    replies.append({
                        "id": str(reply["_id"]),
                        "content": reply["description"],
                        "userId": reply["uid"],
                        "userName": reply_user.get("name", "Anonymous") if reply_user else "Anonymous",
                        "userAvatar": reply_user.get("profilePicture", ""),
                        "timestamp": reply["created_at"],
                        "tag": tag
                    })

            processed_msg = {
                "id": str(msg["_id"]),
                "content": msg["description"],
                "userId": msg["uid"],
                "userName": user.get("name", "Anonymous") if user else "Anonymous",
                "userAvatar": user.get("profilePicture", ""),
                "timestamp": msg["created_at"],  # Already in IST format
                "tag": tag,
                "replies": replies
            }
            processed_messages.append(processed_msg)
        
        return jsonable_encoder(processed_messages)
    except Exception as e:
        logging.error(f"Error fetching {tag} messages: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Initialize the chatbot
bot = FRIDAY()

class ChatMessage(BaseModel):
    message: str
    uid: str  # Add uid to request
    session_id: Optional[str] = None

@app.post("/chat")
async def chat_endpoint(chat_message: ChatMessage):
    try:
        # Get user's API key from MongoDB
        user = await user_profile_collection.find_one(
            {"uid": chat_message.uid},
            {"api_key": 1}
        )
        
        if not user or not user.get("api_key"):
            raise HTTPException(
                status_code=401,
                detail="API key not found. Please configure your API key."
            )

        # Get response using user's API key
        response = await bot.get_response(
            message=chat_message.message,
            uid=chat_message.uid,
            api_key=user["api_key"]
        )
        
        return {
            "response": response,
            "session_id": None
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error(f"Chat endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing chat message")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_db_client():
    logging.info("Operation: shutdown_db_client()")
    await close_db_client()

class ApiKeyRequest(BaseModel):
    uid: str
    api_key: str

@app.post("/save-api-key")
async def save_api_key(request: ApiKeyRequest):
    logging.info(f"Endpoint called: save_api_key() for UID: {request.uid}")
    try:
        success = await mongodb.save_api_key(request.uid, request.api_key)
        if success:
            return {"message": "API key saved successfully"}
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        CustomException(e, sys)

@app.get("/check-api-key/{uid}")
async def check_api_key(uid: str):
    logging.info(f"Endpoint called: check_api_key() for UID: {uid}")
    try:
        has_key = await mongodb.check_api_key_exists(uid)
        return {"hasKey": has_key}
    except Exception as e:
        logging.error(f"Error checking API key: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/prompts")
async def create_prompt(prompt: Prompts):
    try:
        prompt_doc = prompt.dict()
        result = await prompts_collection.insert_one(prompt_doc)
        return {
            "id": str(result.inserted_id),
            "message": "Prompt saved successfully"
        }
    except Exception as e:
        logging.error(f"Error saving prompt: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))