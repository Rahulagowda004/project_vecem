from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import CORS_ORIGINS
from routes.upload_router import router as upload_router
from database.mongodb import close_db_client

app = FastAPI()

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

# Shutdown event
@app.on_event("shutdown")
async def shutdown_db_client():
    await close_db_client()