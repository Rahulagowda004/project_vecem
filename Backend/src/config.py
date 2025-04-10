from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb+srv://admin:8bx2pW7Dglj9j5RY@cluster0.tui77.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    DATABASE_NAME: str = "vecem"
    AZURE_STORAGE_CONNECTION_STRING: str = "DefaultEndpointsProtocol=https;AccountName=vecem;AccountKey=IBA8NXAJTBmjGRulpPWNE+v/7xGTW8rK+eaxzo0DiWSAJAYxaFQkrnMl8ga+Pa7FsaC5lxrUPZRQ+ASt0ZJj3w==;EndpointSuffix=core.windows.net"
    AZURE_CONTAINER_NAME: str = "datasets"
    CORS_ORIGINS: list = [
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

settings = Settings()