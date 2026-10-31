import httpx
from typing import List, Dict, Any, Optional
from app.config import settings

class LanguageModelService:
    def __init__(self):
        self.ollama_url = settings.OLLAMA_URL.rstrip('/')
        self.default_model = settings.OLLAMA_MODEL
        self.code_model = settings.OLLAMA_CODE_MODEL

    async def is_available(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.ollama_url}/api/tags")
                return res.status_code == 200
        except Exception:
            return False

    async def get_available_models(self) -> List[str]:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.ollama_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    return [m.get("name") for m in data.get("models", [])]
        except Exception:
            pass
        return []

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> Dict[str, Any]:
        target_model = model or self.default_model

        # Auto-detect installed model if requested model is missing
        available = await self.get_available_models()
        if available:
            if target_model not in available and not any(m.startswith(target_model) for m in available):
                target_model = available[0]

        payload = {
            "model": target_model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens
            }
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                res = await client.post(f"{self.ollama_url}/api/generate", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return {
                        "text": data.get("response", ""),
                        "model": target_model,
                        "done": data.get("done", True),
                        "total_duration": data.get("total_duration", 0),
                        "eval_count": data.get("eval_count", 0)
                    }
                else:
                    raise RuntimeError(f"Ollama returned status {res.status_code}: {res.text}")
        except httpx.ConnectError:
            raise ConnectionError(
                f"Ollama server is not running at {self.ollama_url}. Please launch Ollama and run `ollama pull {target_model}`."
            )

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        target_model = model or self.default_model
        payload = {
            "model": target_model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                res = await client.post(f"{self.ollama_url}/api/chat", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return {
                        "message": data.get("message", {}),
                        "model": target_model,
                        "eval_count": data.get("eval_count", 0)
                    }
                else:
                    raise RuntimeError(f"Ollama returned status {res.status_code}: {res.text}")
        except httpx.ConnectError:
            raise ConnectionError(
                f"Ollama server is not running at {self.ollama_url}. Please launch Ollama and run `ollama pull {target_model}`."
            )

llm_service = LanguageModelService()
