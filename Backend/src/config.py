from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os
from typing import List, Optional

load_dotenv()

class Settings(BaseSettings):
    # MongoDB Configuration
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb+srv://admin:8bx2pW7Dglj9j5RY@cluster0.tui77.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "vecem")
    
    # Azure Storage Configuration
    AZURE_STORAGE_CONNECTION_STRING: str = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "DefaultEndpointsProtocol=https;AccountName=vecem;AccountKey=IBA8NXAJTBmjGRulpPWNE+v/7xGTW8rK+eaxzo0DiWSAJAYxaFQkrnMl8ga+Pa7FsaC5lxrUPZRQ+ASt0ZJj3w==;EndpointSuffix=core.windows.net")
    AZURE_CONTAINER_NAME: str = os.getenv("AZURE_CONTAINER_NAME", "datasets")
    
    # API Configuration
    PORT: Optional[int] = os.getenv("PORT", 5000)
    ENV: str = os.getenv("ENV", "development")
    
    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://project-vecem.vercel.app",
        "https://*.vercel.app"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # This allows extra fields in the environment without causing errors

settings = Settings()