import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Body
from typing import Optional, List, Dict, Any
from app.services.ocr import ocr_service
from app.services.pdf_processor import pdf_processor
from app.services.document_chat import document_chat
from app.services.language_model import llm_service

router = APIRouter(prefix="/documents", tags=["Document AI"])

@router.post("/ocr")
async def extract_ocr(
    file: UploadFile = File(...)
):
    try:
        content = await file.read()
        filename = (file.filename or "").lower()
        if filename.endswith(".pdf"):
            return ocr_service.extract_text_from_pdf(content)
        else:
            return ocr_service.extract_text_from_image(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize")
async def summarize_document(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    summary_type: str = Form("key_points"), # key_points, executive, tl_dr, bulleted
    length: str = Form("medium") # short, medium, detailed
):
    try:
        text_to_summarize = raw_text or ""
        doc_metadata = {}

        if file:
            content = await file.read()
            doc_data = pdf_processor.extract_document(content)
            text_to_summarize = doc_data["full_text"]
            doc_metadata = doc_data["metadata"]

        if not text_to_summarize.strip():
            raise HTTPException(status_code=400, detail="No document or text provided to summarize.")

        # Truncate if extremely long for single inference
        truncated_text = text_to_summarize[:12000]

        system_prompt = (
            "You are a professional research analyst and document summarizer for ToolNest. "
            f"Provide a {length} summary in the format of {summary_type}. Highlight main takeaways, "
            "action items, key entities, and conclusions."
        )

        user_prompt = f"Document content:\n{truncated_text}\n\nSummary:"

        res = await llm_service.generate(
            prompt=user_prompt,
            system_prompt=system_prompt,
            temperature=0.3
        )

        return {
            "summary": res.get("text", "").strip(),
            "metadata": doc_metadata,
            "original_length": len(text_to_summarize),
            "model": res.get("model")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat_with_document(
    file: Optional[UploadFile] = File(None),
    doc_id: str = Form("default_session"),
    query: str = Form(...),
    chunks_json: Optional[str] = Form(None)
):
    try:
        chunks = None
        if file:
            content = await file.read()
            doc_data = pdf_processor.extract_document(content)
            chunks = doc_data["chunks"]
        elif chunks_json:
            chunks = json.loads(chunks_json)

        result = await document_chat.answer_question(doc_id=doc_id, query=query, chunks=chunks)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
