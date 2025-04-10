from fastapi import Request
from fastapi.responses import JSONResponse
from typing import List
import time

class SecurityMiddleware:
    def __init__(
        self,
        rate_limit_requests: int = 100,
        rate_limit_window: int = 60,
        allowed_hosts: List[str] = None
    ):
        self.rate_limit_requests = rate_limit_requests
        self.rate_limit_window = rate_limit_window
        self.request_history = {}
        self.allowed_hosts = allowed_hosts or []

    async def __call__(self, request: Request, call_next):
        # Rate limiting
        client_ip = request.client.host
        current_time = time.time()
        
        # Clean up old requests
        self.request_history = {
            ip: requests for ip, requests in self.request_history.items()
            if current_time - requests[-1] < self.rate_limit_window
        }
        
        # Check rate limit
        if client_ip in self.request_history:
            requests = self.request_history[client_ip]
            if len(requests) >= self.rate_limit_requests:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests"}
                )
            requests.append(current_time)
        else:
            self.request_history[client_ip] = [current_time]

        # Host validation
        if self.allowed_hosts:
            host = request.headers.get("host", "").split(":")[0]
            if host not in self.allowed_hosts:
                return JSONResponse(
                    status_code=403,
                    content={"detail": "Host not allowed"}
                )

        # Security headers
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response