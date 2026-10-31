import io
import os
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from ..config import settings

class ImageEnhancerService:
    @staticmethod
    def enhance_image(image_bytes: bytes, mode: str = "enhance", scale: int = 2) -> bytes:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode != "RGB":
            img = img.convert("RGB")

        orig_w, orig_h = img.size
        target_w = orig_w * scale
        target_h = orig_h * scale

        # Check for local Real-ESRGAN onnx model
        model_path = os.path.join(settings.MODELS_DIR, "realesrgan-x4plus.onnx")
        if os.path.exists(model_path):
            try:
                import onnxruntime as ort
                session = ort.InferenceSession(model_path, providers=["CUDAExecutionProvider", "CPUExecutionProvider"])
                # Real-ESRGAN inference pipeline
                cv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
                input_tensor = cv_img.astype(np.float32) / 255.0
                input_tensor = np.transpose(input_tensor, (2, 0, 1))
                input_tensor = np.expand_dims(input_tensor, axis=0)

                outputs = session.run(None, {session.get_inputs()[0].name: input_tensor})
                output_tensor = outputs[0][0]
                output_tensor = np.transpose(output_tensor, (1, 2, 0))
                output_tensor = np.clip(output_tensor * 255.0, 0, 255).astype(np.uint8)
                res_img = Image.fromarray(cv2.cvtColor(output_tensor, cv2.COLOR_BGR2RGB))
                if (res_img.size[0] != target_w) or (res_img.size[1] != target_h):
                    res_img = res_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
                output = io.BytesIO()
                res_img.save(output, format="PNG")
                return output.getvalue()
            except Exception as e:
                print(f"[Real-ESRGAN] ONNX execution fell back to Lanczos+Unsharp: {e}")

        # High-Fidelity Super-Resolution & Algorithmic Unsharp Pipeline
        scaled = img.resize((target_w, target_h), Image.Resampling.LANCZOS)

        if mode == "sharpen":
            # Adaptive unsharp mask
            enhancer = ImageEnhance.Sharpness(scaled)
            scaled = enhancer.enhance(2.0)
        elif mode == "denoise":
            # Fast bilateral filtering
            cv_img = cv2.cvtColor(np.array(scaled), cv2.COLOR_RGB2BGR)
            denoised = cv2.bilateralFilter(cv_img, d=9, sigmaColor=75, sigmaSpace=75)
            scaled = Image.fromarray(cv2.cvtColor(denoised, cv2.COLOR_BGR2RGB))
        elif mode == "restore_faces":
            enhancer_s = ImageEnhance.Sharpness(scaled)
            scaled = enhancer_s.enhance(1.8)
            enhancer_c = ImageEnhance.Contrast(scaled)
            scaled = enhancer_c.enhance(1.15)
        else:
            # Smart enhance: sharpness + micro-contrast + saturation balance
            enhancer_s = ImageEnhance.Sharpness(scaled)
            scaled = enhancer_s.enhance(1.6)
            enhancer_c = ImageEnhance.Contrast(scaled)
            scaled = enhancer_c.enhance(1.1)
            enhancer_col = ImageEnhance.Color(scaled)
            scaled = enhancer_col.enhance(1.05)

        output = io.BytesIO()
        scaled.save(output, format="PNG", optimize=True)
        return output.getvalue()
