import io
import os
import cv2
import numpy as np
from PIL import Image
from ..config import settings

class BackgroundRemoverService:
    @staticmethod
    def remove_background(image_bytes: bytes, background_color: str = None) -> bytes:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode != "RGBA":
            img = img.convert("RGBA")

        model_path = os.path.join(settings.MODELS_DIR, "u2net.onnx")
        if os.path.exists(model_path):
            try:
                import onnxruntime as ort
                session = ort.InferenceSession(model_path, providers=["CUDAExecutionProvider", "CPUExecutionProvider"])
                resized = img.resize((320, 320), Image.Resampling.BILINEAR)
                np_img = np.array(resized.convert("RGB")).astype(np.float32) / 255.0
                np_img = (np_img - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
                np_img = np.transpose(np_img, (2, 0, 1))
                np_img = np.expand_dims(np_img, axis=0)

                outputs = session.run(None, {session.get_inputs()[0].name: np_img})
                pred = outputs[0][0, 0, :, :]
                pred = (pred - pred.min()) / (pred.max() - pred.min() + 1e-8)
                mask = Image.fromarray((pred * 255).astype(np.uint8)).resize(img.size, Image.Resampling.BILINEAR)
                img.putalpha(mask)
            except Exception as e:
                print(f"[RMBG] ONNX failed: {e}. Falling back to GrabCut segmentation.")

        # If model is not loaded or failed, use high-precision GrabCut foreground extraction
        if img.getchannel("A").getextrema() == (255, 255):
            rgb = cv2.cvtColor(np.array(img), cv2.COLOR_RGBA2BGR)
            h, w = rgb.shape[:2]
            mask = np.zeros((h, w), np.uint8)
            rect = (int(w * 0.05), int(h * 0.05), int(w * 0.9), int(h * 0.9))
            bgd_model = np.zeros((1, 65), np.float64)
            fgd_model = np.zeros((1, 65), np.float64)
            cv2.grabCut(rgb, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)
            final_mask = np.where((mask == 2) | (mask == 0), 0, 255).astype("uint8")
            # Feather edge
            final_mask = cv2.GaussianBlur(final_mask, (5, 5), 0)
            img.putalpha(Image.fromarray(final_mask))

        # Apply solid background color replacement if requested
        if background_color and background_color.startswith("#"):
            hex_c = background_color.lstrip("#")
            if len(hex_c) == 6:
                r, g, b = tuple(int(hex_c[i:i+2], 16) for i in (0, 2, 4))
                solid_bg = Image.new("RGBA", img.size, (r, g, b, 255))
                solid_bg.paste(img, (0, 0), img)
                img = solid_bg

        output = io.BytesIO()
        img.save(output, format="PNG")
        return output.getvalue()
