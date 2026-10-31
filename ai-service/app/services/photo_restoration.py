import os
import io
import cv2
import numpy as np
from PIL import Image, ImageEnhance
from app.config import settings

class PhotoRestorationService:
    def __init__(self):
        self.gfpgan_path = os.path.join(settings.MODELS_DIR, "GFPGANv1.4.onnx")
        self.session = None
        self._load_session()

    def _load_session(self):
        if os.path.exists(self.gfpgan_path):
            try:
                import onnxruntime as ort
                self.session = ort.InferenceSession(self.gfpgan_path, providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
            except Exception as e:
                print(f"[PhotoRestoration] GFPGAN ONNX load failed: {e}")
                self.session = None

    def restore(self, image_bytes: bytes, denoise_strength: float = 1.0, colorize: bool = False) -> bytes:
        """
        Restores old, degraded, or damaged photographs:
        - Removes scratches / dust spots via morphological filtering and inpainting
        - Denoises luminance and chrominance
        - Enhances contrast (CLAHE) and restores faded colors
        - Applies unsharp masking for crisp details
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Invalid image file")

        # 1. Scratch / dust detection & inpainting
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # High-pass / morph top-hat to catch bright hairline scratches and dust
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        tophat = cv2.morphologyEx(gray, cv2.MORPH_TOPHAT, kernel)
        _, scratch_mask = cv2.threshold(tophat, 30, 255, cv2.THRESH_BINARY)
        # Inpaint detected tiny cracks/scratches
        scratch_cleaned = cv2.inpaint(img, scratch_mask, inpaintRadius=2, flags=cv2.INPAINT_TELEA)

        # 2. Denoising
        h_val = 6.0 * denoise_strength
        denoised = cv2.fastNlMeansDenoisingColored(scratch_cleaned, None, h=h_val, hColor=h_val, templateWindowSize=7, searchWindowSize=21)

        # 3. Contrast adjustment using LAB color space + CLAHE
        lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
        l_clahe = clahe.apply(l)
        enhanced_lab = cv2.merge((l_clahe, a, b))
        contrast_boosted = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

        # 4. Color & Vibrancy enhancement via PIL
        pil_img = Image.fromarray(cv2.cvtColor(contrast_boosted, cv2.COLOR_BGR2RGB))
        color_enhancer = ImageEnhance.Color(pil_img)
        vibrant_img = color_enhancer.enhance(1.25 if not colorize else 1.45)
        sharp_enhancer = ImageEnhance.Sharpness(vibrant_img)
        final_pil = sharp_enhancer.enhance(1.4)

        # Output bytes
        output_buffer = io.BytesIO()
        final_pil.save(output_buffer, format="PNG")
        return output_buffer.getvalue()

photo_restoration = PhotoRestorationService()
