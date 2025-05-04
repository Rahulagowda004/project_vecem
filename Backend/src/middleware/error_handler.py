from fastapi import Request
from fastapi.responses import JSONResponse
from src.utils.logger import logging

async def error_handler(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logging.error(f"Unhandled error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
                "path": request.url.path
            }
        )