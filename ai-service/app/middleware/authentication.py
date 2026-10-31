from fastapi import Request, HTTPException, status
from ..config import settings

async def verify_service_token(request: Request):
    token = request.headers.get("x-ai-service-token")
    if not token or token != settings.AI_SERVICE_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing AI service authorization token"
        )
