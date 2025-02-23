import os
from pydantic_settings import BaseSettings

# Path configuration
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

class Settings(BaseSettings):
    # Base settings
    DATABASE_URL: str = "sqlite:///./test.db"
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Auth0 settings
    auth0_domain: str | None = None
    api_identifier: str | None = None
    client_id: str | None = None
    client_secret: str | None = None

    # MongoDB settings
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_user: str | None = None
    mongodb_password: str | None = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()

# Configuration exports
MONGO_URL = settings.mongodb_uri
DB_NAME = "vecem_db"
CORS_ORIGINS = [
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:5173",
    "http://localhost:3000",  # In case you use a different port
]
