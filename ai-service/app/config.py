import os
from typing import Optional
from pydantic import BaseModel

class Settings(BaseModel):
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    AI_SERVICE_SECRET: str = os.getenv("AI_SERVICE_SECRET", "toolnest_internal_ai_secret_key_8899")
    
    # Provider Selection: 'auto' | 'gemini' | 'nvidia' | 'ollama'
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "auto")
    
    # Google Gemini Configuration (Free via Google AI Studio)
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    
    # NVIDIA NIM Configuration (Free via build.nvidia.com)
    NVIDIA_API_KEY: Optional[str] = os.getenv("NVIDIA_API_KEY", None)
    NVIDIA_BASE_URL: str = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
    NVIDIA_MODEL: str = os.getenv("NVIDIA_MODEL", "meta/llama-3.3-70b-instruct")
    NVIDIA_CODE_MODEL: str = os.getenv("NVIDIA_CODE_MODEL", "qwen/qwen2.5-coder-32b-instruct")
    
    # Local Ollama Fallback Configuration
    OLLAMA_URL: str = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2:1b")
    OLLAMA_CODE_MODEL: str = os.getenv("OLLAMA_CODE_MODEL", "qwen2.5-coder:1.5b")
    OLLAMA_EMBED_MODEL: str = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
    
    MODELS_DIR: str = os.getenv("MODELS_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models")))
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "25"))
    DEVICE: str = os.getenv("DEVICE", "auto")

settings = Settings()
