import time
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.middleware.authentication import verify_api_token
from app.models.model_registry import model_registry
from app.routes import image, documents, writing, developer, design

app = FastAPI(
    title="ToolNest AI Microservice",
    description="Dedicated high-performance microservice for open-source AI inference, document processing, and image algorithms.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public health endpoints
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "toolnest-ai-service",
        "timestamp": time.time(),
        "environment": settings.ENVIRONMENT
    }

@app.get("/api/models/status")
async def get_models_status():
    """
    Returns live model availability, detected hardware (GPU/CPU),
    and whether models/Ollama are ready.
    """
    status = await model_registry.check_all()
    return status

# Protected API routes
app.include_router(image.router, prefix="/api", dependencies=[Depends(verify_api_token)])
app.include_router(documents.router, prefix="/api", dependencies=[Depends(verify_api_token)])
app.include_router(writing.router, prefix="/api", dependencies=[Depends(verify_api_token)])
app.include_router(developer.router, prefix="/api", dependencies=[Depends(verify_api_token)])
app.include_router(design.router, prefix="/api", dependencies=[Depends(verify_api_token)])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
