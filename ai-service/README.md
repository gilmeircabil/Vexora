# VexoraMods AI Microservice

Dedicated Python FastAPI microservice for local, self-hosted open-source AI models and computer vision pipelines.

## Architecture & Principles
- **Zero Paid Third-Party APIs**: Runs completely self-hosted with local open-source models (Ollama, PyTorch, ONNX, OpenCV, PyMuPDF).
- **Separation of Concerns**: Isolated from the main Node.js Express API.
- **Accurate Model Reporting**: Reports live hardware and model readiness (no fake responses).

## Prerequisites
- Python 3.10+
- [Ollama](https://ollama.com/) (for LLM capabilities)

## Quick Start (Local)

1. **Install Dependencies**:
```bash
cd ai-service
pip install -r requirements.txt
```

2. **Run Ollama Models**:
```bash
ollama pull llama3.2
ollama pull qwen2.5-coder:7b
```

3. **Start the Service**:
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Docker Deployment

```bash
docker build -t vexoramods-ai-service .
docker run -p 8000:8000 --env-file .env vexoramods-ai-service
```

## Supported Endpoints
- `GET /health` - Microservice health check
- `GET /api/models/status` - Live model and hardware status
- `POST /api/image/enhance` - Image upscaling and enhancement
- `POST /api/image/remove-background` - Background removal
- `POST /api/image/remove-object` - Interactive inpainting
- `POST /api/image/restore-photo` - Photo scratch removal & restoration
- `POST /api/documents/ocr` - OCR text extraction
- `POST /api/documents/summarize` - Document summarization
- `POST /api/documents/chat` - RAG document question answering
- `POST /api/writing/assist` - Tone, grammar, and style rewriting
- `POST /api/writing/resume` - ATS resume builder
- `POST /api/developer/explain-code` - Code walkthrough & complexity
- `POST /api/developer/explain-error` - Debugging & fix generation
- `POST /api/design/generate-social` - VexoraMods Studio JSON generation
