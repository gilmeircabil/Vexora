from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ModelStatus(BaseModel):
    model_id: str
    name: str
    tool: str
    version: str
    license: str
    status: str  # "available", "downloading", "missing_weights", "offline"
    hardware: str
    description: str
    path: Optional[str] = None
    instructions: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    service: str
    device: str
    cpu_count: int
    memory_used_mb: float
    ollama_connected: bool
    models: List[ModelStatus]

class ImageEnhanceRequest(BaseModel):
    mode: str = Field(default="enhance", description="enhance, denoise, sharpen, restore_faces")
    scale: int = Field(default=2, ge=1, le=4)
    format: str = Field(default="image/png")

class BackgroundRemovalRequest(BaseModel):
    background_color: Optional[str] = None
    output_format: str = "image/png"

class ObjectRemovalRequest(BaseModel):
    dilate_mask: int = Field(default=5, ge=0, le=25)

class WritingRequest(BaseModel):
    text: str
    task: str = Field(default="rewrite", description="grammar, rewrite, summarize, expand, simplify, tone, outline")
    tone: Optional[str] = Field(default="professional", description="professional, casual, persuasive, concise, academic")
    target_language: Optional[str] = None

class ResumeRequest(BaseModel):
    full_name: str
    target_role: str
    summary: Optional[str] = None
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    skills: List[str] = []
    projects: List[Dict[str, Any]] = []
    template: str = "modern"

class CodeExplainRequest(BaseModel):
    code: str
    language: str = "javascript"
    mode: str = "detailed"  # summary, detailed, complexity, bugs

class ErrorExplainRequest(BaseModel):
    error_message: str
    code_context: Optional[str] = None
    language: str = "javascript"

class PdfSummarizeRequest(BaseModel):
    max_chunk_tokens: int = 2000
    detail_level: str = "medium"  # brief, medium, comprehensive

class PdfChatRequest(BaseModel):
    question: str
    document_id: str
    history: List[Dict[str, str]] = []

class SocialDesignRequest(BaseModel):
    prompt: str
    category: str = "instagram-post"  # instagram-post, facebook-cover, instagram-story, youtube-thumbnail
    color_mood: str = "vibrant"
    aspect_ratio: str = "1:1"
