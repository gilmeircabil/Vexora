import os
import io
import cv2
import numpy as np
from PIL import Image
from app.config import settings

class ObjectRemoverService:
    def __init__(self):
        self.model_path = os.path.join(settings.MODELS_DIR, "lama_fp32.onnx")
        self.session = None
        self._load_session()

    def _load_session(self):
        if os.path.exists(self.model_path):
            try:
                import onnxruntime as ort
                self.session = ort.InferenceSession(self.model_path, providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
            except Exception as e:
                print(f"[ObjectRemover] Failed to load LaMa ONNX: {e}")
                self.session = None

    def inpaint(self, image_bytes: bytes, mask_bytes: bytes) -> bytes:
        """
        Removes object marked by mask from image.
        If LaMa ONNX model is available, uses neural inpainting.
        Otherwise falls back to high quality OpenCV Navier-Stokes/Telea inpainting algorithm.
        """
        # Load image
        nparr_img = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr_img, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Invalid image input")

        h, w, c = img.shape

        # Load mask
        nparr_mask = np.frombuffer(mask_bytes, np.uint8)
        mask = cv2.imdecode(nparr_mask, cv2.IMREAD_GRAYSCALE)
        if mask is None:
            # If mask is invalid, create blank
            mask = np.zeros((h, w), dtype=np.uint8)
        else:
            if mask.shape[:2] != (h, w):
                mask = cv2.resize(mask, (w, h), interpolation=cv2.INTER_NEAREST)

        # Threshold mask to binary 0 / 255
        _, binary_mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)

        # If ONNX session loaded, run neural inpainting
        if self.session is not None:
            try:
                # LaMa expects 512x512 normalized inputs
                target_size = 512
                img_resized = cv2.resize(img, (target_size, target_size))
                mask_resized = cv2.resize(binary_mask, (target_size, target_size))

                # Normalize image [0, 1] and mask [0, 1]
                norm_img = img_resized.astype(np.float32) / 255.0
                norm_mask = (mask_resized > 127).astype(np.float32)[:, :, None]

                # Format (1, C, H, W)
                input_img = np.transpose(norm_img, (2, 0, 1))[None, ...]
                input_mask = np.transpose(norm_mask, (2, 0, 1))[None, ...]

                inputs = {
                    self.session.get_inputs()[0].name: input_img,
                    self.session.get_inputs()[1].name: input_mask
                }
                outputs = self.session.run(None, inputs)
                result_tensor = outputs[0][0]
                result_img = np.transpose(result_tensor, (1, 2, 0))
                result_img = np.clip(result_img * 255.0, 0, 255).astype(np.uint8)
                result = cv2.resize(result_img, (w, h))

                # Blend original non-masked areas to avoid artifacts
                mask_inv = cv2.bitwise_not(binary_mask)
                bg = cv2.bitwise_and(img, img, mask=mask_inv)
                fg = cv2.bitwise_and(result, result, mask=binary_mask)
                final = cv2.add(bg, fg)

                is_success, buffer = cv2.imencode(".png", final)
                return buffer.tobytes()
            except Exception as e:
                print(f"[ObjectRemover] Neural inpainting error, falling back to cv2.inpaint: {e}")

        # Fallback: OpenCV Navier-Stokes inpainting
        # Dilate mask slightly to cover edge borders
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        dilated_mask = cv2.dilate(binary_mask, kernel, iterations=2)
        inpainted = cv2.inpaint(img, dilated_mask, inpaintRadius=5, flags=cv2.INPAINT_NS)

        is_success, buffer = cv2.imencode(".png", inpainted)
        return buffer.tobytes()

object_remover = ObjectRemoverService()
