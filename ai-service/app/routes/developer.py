import json
from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from app.services.language_model import llm_service
from app.config import settings

router = APIRouter(prefix="/developer", tags=["Developer AI"])

@router.post("/explain-code")
async def explain_code(payload: Dict[str, Any] = Body(...)):
    code = payload.get("code", "")
    language = payload.get("language", "auto")
    detail_level = payload.get("detail_level", "intermediate") # beginner, intermediate, expert

    if not code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty.")

    system_prompt = (
        f"You are ToolNest Senior Code Explainer. Explain this code for a {detail_level} developer. "
        "Structure your response with: "
        "1. Overview & Purpose\n"
        "2. Step-by-Step Breakdown\n"
        "3. Time & Space Complexity (Big-O)\n"
        "4. Edge Cases & Potential Improvements"
    )

    user_prompt = f"Language: {language}\n\n```{language}\n{code}\n```"

    try:
        res = await llm_service.generate(
            prompt=user_prompt,
            system_prompt=system_prompt,
            model=settings.OLLAMA_CODE_MODEL,
            temperature=0.3
        )
        return {
            "explanation": res.get("text", "").strip(),
            "language": language,
            "detail_level": detail_level,
            "model": res.get("model")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain-error")
async def explain_error(payload: Dict[str, Any] = Body(...)):
    error_message = payload.get("error_message", "")
    code_context = payload.get("code_context", "")
    runtime_env = payload.get("runtime_env", "Node.js / Browser")

    if not error_message.strip():
        raise HTTPException(status_code=400, detail="Error message cannot be empty.")

    system_prompt = (
        "You are ToolNest Debugging AI. Diagnose the software error and provide clear, actionable fixes.\n"
        "Structure your response with:\n"
        "1. Root Cause Explanation (What happened and why)\n"
        "2. Immediate Solution (Step-by-step fix)\n"
        "3. Fixed Code Example\n"
        "4. How to Prevent This in the Future"
    )

    user_prompt = f"Environment: {runtime_env}\n\nError Message:\n{error_message}\n\nCode Context:\n{code_context}"

    try:
        res = await llm_service.generate(
            prompt=user_prompt,
            system_prompt=system_prompt,
            model=settings.OLLAMA_CODE_MODEL,
            temperature=0.3
        )
        return {
            "analysis": res.get("text", "").strip(),
            "model": res.get("model")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
