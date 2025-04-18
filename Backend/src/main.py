import sys
import uuid
import base64
from datetime import datetime, timedelta
import pytz
from bson import ObjectId
from bson.errors import InvalidId
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
from src.models.dataset_models import DatasetSchema, DatasetInfo, Files
from src.config import settings
from src.middleware.error_handler import error_handler

app = FastAPI(
    title="Vecem API",
    version="1.0.0",
    description="Vecem API for managing datasets and user profiles",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security middleware
from src.middleware.security import SecurityMiddleware
app.middleware("http")(SecurityMiddleware(
    rate_limit_requests=100,
    rate_limit_window=60,
    allowed_hosts=settings.ALLOWED_HOSTS if hasattr(settings, 'ALLOWED_HOSTS') else []
))

# Add error handler middleware
app.middleware("http")(error_handler)

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
                hasChangedUsername=False,
                profilePicture="/avatars/default.png"  # Add default avatar path
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
        
        # Convert to DatasetSchema format    
        dataset["_id"] = str(dataset["_id"])
        dataset["username"] = username
        return jsonable_encoder(DatasetSchema(**dataset))
        
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
            
        # Query the dataset and include dataset type information
        dataset = await datasets_collection.find_one({
            "uid": uid,
            "dataset_info.name": dataset_name
        })
        
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Convert ObjectId to string for JSON serialization
        dataset["_id"] = str(dataset["_id"])
        
        # Add dataset type information
        dataset_type = "Both"
        if dataset.get("files"):
            has_raw = bool(dataset["files"].get("raw"))
            has_vectorized = bool(dataset["files"].get("vectorized"))
            
            if has_raw and not has_vectorized:
                dataset_type = "Raw"
            elif has_vectorized and not has_raw:
                dataset_type = "Vectorized"
            elif has_raw and has_vectorized:
                dataset_type = "Both"
        
        dataset["dataset_type"] = dataset_type
        
        # Log the edit action
        logging.info(f"Dataset edit clicked - UID: {uid}, Dataset: {dataset_name}, Type: {dataset_type}")
        
        return jsonable_encoder(dataset)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/update-dataset/{dataset_id}")
async def update_dataset(dataset_id: str, updated_data: dict):
    logging.info(f"Endpoint called: update_dataset() for dataset_id: {dataset_id} with data: {updated_data}")
    try:
        object_id = ObjectId(dataset_id)
        
        if not updated_data.get("userId"):
            raise HTTPException(status_code=400, detail="User ID is required")
            
        dataset = await datasets_collection.find_one({
            "_id": object_id,
            "uid": updated_data["userId"]
        })
        
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Determine upload_type based on available files
        files = dataset.get("files", {})
        has_raw = bool(files.get("raw"))
        has_vectorized = bool(files.get("vectorized"))
        upload_type = "both" if has_raw and has_vectorized else (
            "raw" if has_raw else "vectorized" if has_vectorized else dataset.get("upload_type", "raw")
        )
        
        # Update using new schema format
        update_dict = {
            "dataset_info": {
                "name": updated_data.get("name"),
                "description": updated_data.get("description"),
                "domain": updated_data.get("domain"),
                "file_type": updated_data.get("fileType"),
                "dimensions": updated_data.get("vectorizedSettings", {}).get("dimensions"),
                "vector_database": updated_data.get("vectorizedSettings", {}).get("vectorDatabase"),
                "model_name": updated_data.get("vectorizedSettings", {}).get("modelName"),
                "license": dataset["dataset_info"].get("license", ""),  # Preserve existing license
                "username": dataset["dataset_info"].get("username", ""), # Preserve username
                "datasetId": dataset["dataset_id"]  # Preserve dataset_id
            },
            "upload_type": upload_type,
            "timestamp": datetime.now()
        }
        
        result = await datasets_collection.update_one(
            {"_id": object_id},
            {"$set": update_dict}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Failed to update dataset")
            
        return {"message": "Dataset updated successfully", "status": "success"}
        
    except Exception as e:
        logging.error(f"Error updating dataset: {str(e)}")
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
            # Handle cases where user might not exist
            user = await user_profile_collection.find_one({"uid": msg.get("uid")})
            user_name = "Anonymous"
            user_avatar = ""
            
            if user:
                user_name = user.get("name", "Anonymous")
                user_avatar = user.get("profilePicture", "")
            
            # Get replies for issues
            replies = []
            if tag == "issue":
                replies_cursor = await replies_collection.find(
                    {"issue_id": str(msg["_id"])}
                ).sort("created_at", 1).to_list(None)
                
                for reply in replies_cursor:
                    reply_user = await user_profile_collection.find_one({"uid": reply.get("uid")})
                    reply_name = "Anonymous"
                    reply_avatar = ""
                    
                    if reply_user:
                        reply_name = reply_user.get("name", "Anonymous")
                        reply_avatar = reply_user.get("profilePicture", "")
                        
                    replies.append({
                        "id": str(reply["_id"]),
                        "content": reply.get("description", ""),
                        "userId": reply.get("uid", ""),
                        "userName": reply_name,
                        "userAvatar": reply_avatar,
                        "timestamp": reply.get("created_at", datetime.now(ist).strftime('%Y-%m-%d %H:%M:%S %Z')),
                        "tag": tag
                    })

            processed_msg = {
                "id": str(msg["_id"]),
                "content": msg.get("description", ""),
                "userId": msg.get("uid", ""),
                "userName": user_name,
                "userAvatar": user_avatar,
                "timestamp": msg.get("created_at", datetime.now(ist).strftime('%Y-%m-%d %H:%M:%S %Z')),
                "tag": tag,
                "replies": replies
            }
            processed_messages.append(processed_msg)
        
        return jsonable_encoder(processed_messages)
    except Exception as e:
        logging.error(f"Error fetching {tag} messages: {str(e)}")
        return []  # Return empty list instead of raising error

# Initialize the chatbot
bot = None

class ChatMessage(BaseModel):
    message: str
    uid: str

@app.post("/chat")
async def chat_endpoint(chat_message: ChatMessage):
    try:
        # Create new bot instance for each message to ensure fresh API key
        bot = FRIDAY(chat_message.uid)
        await bot.initialize()  # This will fetch the latest API key
        response = await bot.get_response(chat_message.message)
        return {"response": response}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Add these new endpoints before the shutdown event
@app.post("/prompt-click")
async def log_prompt_click(data: dict):
    logging.info(f"Endpoint called: log_prompt_click() for UID: {data.get('uid')}, prompt: {data.get('promptName')}")
    try:
        uid = data.get('uid')
        prompt_name = data.get('promptName')
        
        if not uid or not prompt_name:
            raise HTTPException(status_code=400, detail="UID and promptName are required")
            
        # Log the click (you can add more detailed logging if needed)
        logging.info(f"Prompt click logged - UID: {uid}, Prompt: {prompt_name}")
        
        return {"status": "success", "message": "Prompt click logged successfully"}
        
    except Exception as e:
        logging.error(f"Error logging prompt click: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/prompts/{username}/{prompt_name}")
async def get_prompt_details(username: str, prompt_name: str):
    try:
        # Find the prompt in the prompts collection
        prompt = await prompts_collection.find_one({"username": username, "prompt_name": prompt_name})
        
        if not prompt:
            raise HTTPException(status_code=404, detail="Prompt not found")
            
        return {
            "prompt_name": prompt.get("prompt_name"),
            "domain": prompt.get("domain", "General"),
            "prompt_content": prompt.get("prompt"),
            "username": prompt.get("username"),  # Make sure username is included
            "created_at": prompt.get("createdAt", ""),
            "updated_at": prompt.get("updatedAt", "")
        }
        
    except Exception as e:
        logging.error(f"Error fetching prompt details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/prompts")
async def get_prompts():
    try:
        # Fetch all prompts from the prompts collection
        prompts = await prompts_collection.find({}).to_list(None)
        
        # Convert ObjectIds to strings for JSON serialization
        for prompt in prompts:
            prompt["_id"] = str(prompt["_id"])
            
        return prompts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/prompts/{prompt_id}")
async def delete_prompt(prompt_id: str):
    try:
        # Convert string ID to ObjectId
        prompt_obj_id = ObjectId(prompt_id)
        
        # Find and delete the prompt
        result = await prompts_collection.delete_one({"_id": prompt_obj_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Prompt not found")
            
        return {"message": "Prompt deleted successfully"}
        
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid prompt ID format")
    except Exception as e:
        logging.error(f"Error deleting prompt: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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
        ist = pytz.timezone('Asia/Kolkata')
        prompt_doc = {
            **prompt.dict(),
            "createdAt": datetime.now(ist).strftime('%m-%d-%Y')
        }
        result = await prompts_collection.insert_one(prompt_doc)
        return {
            "id": str(result.inserted_id),
            "message": "Prompt saved successfully"
        }
    except Exception as e:
        logging.error(f"Error saving prompt: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring and status verification
    Returns health status of API and connected services
    """
    try:
        # Check MongoDB connection
        db_status = "healthy"
        db_error = None
        try:
            # Ping MongoDB to verify connection
            await mongodb.mongo_client.admin.command('ping')
        except Exception as e:
            db_status = "unhealthy"
            db_error = str(e)
        
        # Check Azure Blob Storage connection
        storage_status = "healthy"
        storage_error = None
        try:
            # List containers to verify connection
            from src.utils.azure_storage import blob_service_client
            containers = list(blob_service_client.list_containers(max_results=1))
        except Exception as e:
            storage_status = "unhealthy"
            storage_error = str(e)
            
        return {
            "status": "online",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "services": {
                "database": {
                    "status": db_status,
                    "error": db_error
                },
                "storage": {
                    "status": storage_status,
                    "error": storage_error
                }
            }
        }
    except Exception as e:
        logging.error(f"Health check failed: {str(e)}")
        return {
            "status": "degraded",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }