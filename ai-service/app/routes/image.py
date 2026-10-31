from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
from typing import Optional
from app.services.image_enhancer import image_enhancer
from app.services.background_remover import background_remover
from app.services.object_remover import object_remover
from app.services.photo_restoration import photo_restoration

router = APIRouter(prefix="/image", tags=["Image AI"])

@router.post("/enhance")
async def enhance_image(
    file: UploadFile = File(...),
    scale: int = Form(2),
    quality: str = Form("balanced")
):
    try:
        content = await file.read()
        enhanced_bytes = image_enhancer.enhance(content, scale=scale, quality=quality)
        return Response(content=enhanced_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/remove-background")
async def remove_background(
    file: UploadFile = File(...),
    bg_color: Optional[str] = Form(None)
):
    try:
        content = await file.read()
        processed_bytes = background_remover.remove_background(content, bg_color=bg_color)
        return Response(content=processed_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/remove-object")
async def remove_object(
    image: UploadFile = File(...),
    mask: UploadFile = File(...)
):
    try:
        image_bytes = await image.read()
        mask_bytes = await mask.read()
        processed_bytes = object_remover.inpaint(image_bytes, mask_bytes)
        return Response(content=processed_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/restore-photo")
async def restore_photo(
    file: UploadFile = File(...),
    denoise_strength: float = Form(1.0),
    colorize: bool = Form(False)
):
    try:
        content = await file.read()
        processed_bytes = photo_restoration.restore(content, denoise_strength=denoise_strength, colorize=colorize)
        return Response(content=processed_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
