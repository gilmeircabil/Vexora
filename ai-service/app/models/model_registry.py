import os
import psutil
import httpx
from typing import List, Dict, Any
from ..config import settings
from ..schemas.models import ModelStatus

class ModelRegistry:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelRegistry, cls).__new__(cls)
            cls._instance._models = {}
            cls._instance._init_catalog()
        return cls._instance

    def _init_catalog(self):
        self._catalog = [
            {
                "model_id": "real-esrgan-x4plus",
                "name": "Real-ESRGAN x4+",
                "tool": "ai-image-enhancer",
                "version": "v0.3.0",
                "license": "BSD-3-Clause",
                "hardware": "CPU (8GB RAM) / GPU (CUDA >= 4GB VRAM)",
                "description": "High-fidelity blind image super-resolution and edge enhancement.",
                "filename": "realesrgan-x4plus.onnx",
                "instructions": "Place realesrgan-x4plus.onnx in the ai-service/models directory."
            },
            {
                "model_id": "u2net-rmbg",
                "name": "RMBG (u2net / bria-rmbg)",
                "tool": "ai-background-remover",
                "version": "v1.4",
                "license": "Apache-2.0",
                "hardware": "CPU (4GB RAM) / GPU",
                "description": "Salient object segmentation and transparent alpha-matte extraction.",
                "filename": "u2net.onnx",
                "instructions": "Place u2net.onnx in the ai-service/models directory."
            },
            {
                "model_id": "lama-inpainting",
                "name": "LaMa Large Inpainting",
                "tool": "ai-object-remover",
                "version": "v1.0",
                "license": "Apache-2.0",
                "hardware": "CPU (8GB RAM) / GPU",
                "description": "Resolution-robust fast Fourier convolution inpainting for object removal.",
                "filename": "big-lama.onnx",
                "instructions": "Place big-lama.onnx in the ai-service/models directory."
            },
            {
                "model_id": "gfpgan-v1.4",
                "name": "GFPGAN Face Restorer",
                "tool": "ai-photo-restoration",
                "version": "v1.4",
                "license": "Apache-2.0",
                "hardware": "CPU (8GB RAM) / GPU",
                "description": "Generative facial prior restoration for aged, blurred, and faded photos.",
                "filename": "GFPGANv1.4.onnx",
                "instructions": "Place GFPGANv1.4.onnx in the ai-service/models directory."
            },
            {
                "model_id": "paddle-ocr-v4",
                "name": "PaddleOCR Mobile PP-OCRv4",
                "tool": "ai-ocr",
                "version": "v4.0",
                "license": "Apache-2.0",
                "hardware": "CPU (2GB RAM)",
                "description": "Text detection and recognition engine supporting multi-page scanning.",
                "filename": "ocr_det_rec.onnx",
                "instructions": "Run pip install paddleocr or place ONNX weights in models directory."
            },
            {
                "model_id": "gemini-cloud-llm",
                "name": f"Google Gemini Cloud LLM ({settings.GEMINI_MODEL})",
                "tool": "ai-writing-assistant, ai-resume-builder, ai-pdf-summarizer, ai-pdf-chat, ai-code-explainer",
                "version": "Latest",
                "license": "Google Gemini Free API Tier",
                "hardware": "Google Cloud Infrastructure (Zero Local RAM)",
                "description": "High-throughput, free cloud generative language and coding model via Google AI Studio.",
                "filename": None,
                "instructions": "Add GEMINI_API_KEY to your .env file from https://aistudio.google.com."
            },
            {
                "model_id": "nvidia-cloud-llm",
                "name": f"NVIDIA NIM Cloud LLM ({settings.NVIDIA_MODEL})",
                "tool": "ai-writing-assistant, ai-resume-builder, ai-pdf-summarizer, ai-pdf-chat, ai-code-explainer",
                "version": "Latest",
                "license": "NVIDIA Evaluation Free Tier",
                "hardware": "NVIDIA H100 Cloud Acceleration",
                "description": "Open-source frontier models (Llama 3.3, Qwen 2.5 Coder) accelerated on NVIDIA infrastructure.",
                "filename": None,
                "instructions": "Add NVIDIA_API_KEY to your .env file from https://build.nvidia.com."
            },
            {
                "model_id": "ollama-general-llm",
                "name": f"Ollama Local LLM ({settings.OLLAMA_MODEL})",
                "tool": "ai-writing-assistant, ai-resume-builder, ai-pdf-summarizer, ai-pdf-chat, ai-social-design",
                "version": "Latest",
                "license": "Open Source Community (Meta Llama 3 / Qwen)",
                "hardware": "CPU (8GB RAM) / GPU (CUDA/Vulkan)",
                "description": "Local offline language model inference via Ollama server.",
                "filename": None,
                "instructions": f"Ensure Ollama is running at {settings.OLLAMA_URL} and run 'ollama run {settings.OLLAMA_MODEL}'."
            },
            {
                "model_id": "ollama-code-llm",
                "name": f"Ollama Coding LLM ({settings.OLLAMA_CODE_MODEL})",
                "tool": "ai-code-explainer, ai-error-explainer",
                "version": "Latest",
                "license": "Apache-2.0",
                "hardware": "CPU (8GB RAM) / GPU",
                "description": "Instruction-tuned coding model for syntax, algorithm analysis, and debugging.",
                "filename": None,
                "instructions": f"Run 'ollama run {settings.OLLAMA_CODE_MODEL}' on your local Ollama instance."
            }
        ]

    async def check_ollama(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{settings.OLLAMA_URL}/api/tags")
                return res.status_code == 200
        except Exception:
            return False

    def get_hardware_info(self) -> Dict[str, Any]:
        mem = psutil.virtual_memory()
        return {
            "cpu_count": psutil.cpu_count(logical=True),
            "cpu_percent": psutil.cpu_percent(interval=0.1),
            "memory_total_gb": round(mem.total / (1024**3), 2),
            "memory_available_gb": round(mem.available / (1024**3), 2),
            "device": "CUDA" if os.getenv("CUDA_VISIBLE_DEVICES") else "CPU"
        }

    async def list_models(self) -> List[ModelStatus]:
        ollama_active = await self.check_ollama()
        models_dir = settings.MODELS_DIR
        os.makedirs(models_dir, exist_ok=True)

        statuses = []
        for item in self._catalog:
            status = "available"
            path = None

            if "gemini" in item["model_id"]:
                status = "available" if settings.GEMINI_API_KEY else "unconfigured"
            elif "nvidia" in item["model_id"]:
                status = "available" if settings.NVIDIA_API_KEY else "unconfigured"
            elif "ollama" in item["model_id"]:
                if ollama_active:
                    status = "available"
                else:
                    status = "offline"
            else:
                # Local file-based weights
                filename = item.get("filename")
                if filename:
                    local_path = os.path.join(models_dir, filename)
                    if os.path.exists(local_path):
                        status = "available"
                        path = local_path
                    else:
                        status = "missing_weights"

            statuses.append(ModelStatus(
                model_id=item["model_id"],
                name=item["name"],
                tool=item["tool"],
                version=item["version"],
                license=item["license"],
                status=status,
                hardware=item["hardware"],
                description=item["description"],
                path=path,
                instructions=item.get("instructions")
            ))
        return statuses

model_registry = ModelRegistry()
