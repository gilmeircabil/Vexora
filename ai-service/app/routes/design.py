from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from app.services.design_generator import design_generator

router = APIRouter(prefix="/design", tags=["Design AI"])

@router.post("/generate-social")
async def generate_social_design(payload: Dict[str, Any] = Body(...)):
    prompt = payload.get("prompt", "")
    category = payload.get("category", "instagram_post")
    theme = payload.get("theme", "neo_brutalist")
    headline = payload.get("headline", None)

    if not prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    try:
        result = await design_generator.generate_design(
            prompt=prompt,
            category=category,
            theme=theme,
            headline=headline
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
