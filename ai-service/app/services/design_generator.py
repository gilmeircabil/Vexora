import json
from typing import Dict, Any, Optional
from app.services.language_model import llm_service

DIMENSIONS = {
    "instagram_post": (1080, 1080),
    "instagram_story": (1080, 1920),
    "facebook_cover": (820, 312),
    "youtube_thumbnail": (1280, 720),
    "poster": (1200, 1600),
    "banner": (1200, 630),
    "square": (1080, 1080)
}

COLOR_THEMES = {
    "modern_dark": {"bg": "#0F172A", "primary": "#38BDF8", "accent": "#FACC15", "text": "#FFFFFF", "subtext": "#94A3B8"},
    "neo_brutalist": {"bg": "#FAF7F2", "primary": "#FACC15", "accent": "#FF4D4D", "text": "#000000", "subtext": "#333333"},
    "vibrant_gradient": {"bg": "#4F46E5", "primary": "#06B6D4", "accent": "#F43F5E", "text": "#FFFFFF", "subtext": "#E0E7FF"},
    "minimal_clean": {"bg": "#FFFFFF", "primary": "#18181B", "accent": "#3B82F6", "text": "#09090B", "subtext": "#71717A"}
}

class DesignGeneratorService:
    async def generate_design(
        self,
        prompt: str,
        category: str = "instagram_post",
        theme: str = "neo_brutalist",
        headline: Optional[str] = None
    ) -> Dict[str, Any]:
        width, height = DIMENSIONS.get(category, (1080, 1080))
        palette = COLOR_THEMES.get(theme, COLOR_THEMES["neo_brutalist"])

        # Try to parse or refine copywriting using LLM
        clean_headline = headline or prompt
        clean_subheadline = "Create, Inspire & Empower"
        clean_cta = "Learn More"

        try:
            if await llm_service.is_available():
                system_prompt = (
                    "You are a professional social media marketing copywriter. "
                    "Return a JSON object with keys 'headline' (3-6 words punchy), 'subheadline' (5-10 words), and 'cta' (2-3 words button text)."
                )
                user_msg = f"Theme/Topic: {prompt}. Return only raw valid JSON without markdown formatting."
                res = await llm_service.generate(prompt=user_msg, system_prompt=system_prompt, temperature=0.7)
                raw_text = res.get("text", "").strip()
                # strip code fences if present
                if raw_text.startswith("```"):
                    raw_text = raw_text.split("```")[1]
                    if raw_text.startswith("json"):
                        raw_text = raw_text[4:]
                parsed = json.loads(raw_text.strip())
                clean_headline = parsed.get("headline", clean_headline)
                clean_subheadline = parsed.get("subheadline", clean_subheadline)
                clean_cta = parsed.get("cta", clean_cta)
        except Exception:
            pass # Fall back to template defaults

        # Build Fabric.js compliant objects
        scale_factor = width / 1080.0
        h_center = width / 2
        v_center = height / 2

        objects = [
            # Background Rect
            {
                "type": "rect",
                "left": 0,
                "top": 0,
                "width": width,
                "height": height,
                "fill": palette["bg"],
                "selectable": False,
                "name": "Background"
            },
            # Decorative Top Accent Shape
            {
                "type": "rect",
                "left": width * 0.08,
                "top": height * 0.12,
                "width": width * 0.84,
                "height": 12 * scale_factor,
                "fill": palette["primary"],
                "rx": 6,
                "ry": 6,
                "selectable": True,
                "name": "Accent Bar"
            },
            # Main Headline Textbox
            {
                "type": "textbox",
                "left": width * 0.08,
                "top": height * 0.28,
                "width": width * 0.84,
                "text": clean_headline.upper(),
                "fontSize": int(68 * scale_factor),
                "fontFamily": "Inter, sans-serif",
                "fontWeight": "800",
                "fill": palette["text"],
                "textAlign": "center",
                "lineHeight": 1.15,
                "selectable": True,
                "name": "Headline"
            },
            # Subtitle Textbox
            {
                "type": "textbox",
                "left": width * 0.12,
                "top": height * 0.52,
                "width": width * 0.76,
                "text": clean_subheadline,
                "fontSize": int(28 * scale_factor),
                "fontFamily": "Inter, sans-serif",
                "fontWeight": "500",
                "fill": palette["subtext"],
                "textAlign": "center",
                "lineHeight": 1.3,
                "selectable": True,
                "name": "Subtitle"
            },
            # CTA Badge Card / Button
            {
                "type": "rect",
                "left": h_center - (160 * scale_factor),
                "top": height * 0.72,
                "width": 320 * scale_factor,
                "height": 64 * scale_factor,
                "fill": palette["accent"],
                "stroke": "#000000",
                "strokeWidth": 2,
                "rx": 10,
                "ry": 10,
                "selectable": True,
                "name": "CTA Button"
            },
            # CTA Text
            {
                "type": "textbox",
                "left": h_center - (150 * scale_factor),
                "top": height * 0.72 + (16 * scale_factor),
                "width": 300 * scale_factor,
                "text": clean_cta.upper(),
                "fontSize": int(22 * scale_factor),
                "fontFamily": "Inter, sans-serif",
                "fontWeight": "700",
                "fill": "#000000",
                "textAlign": "center",
                "selectable": True,
                "name": "CTA Text"
            }
        ]

        design_data = {
            "version": "5.3.0",
            "objects": objects,
            "background": palette["bg"]
        }

        return {
            "title": f"AI Design: {clean_headline[:30]}",
            "category": category,
            "width": width,
            "height": height,
            "theme": theme,
            "canvas_data": design_data,
            "headline": clean_headline,
            "subheadline": clean_subheadline
        }

design_generator = DesignGeneratorService()
