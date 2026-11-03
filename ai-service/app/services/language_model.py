import os
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings

class LanguageModelService:
    def __init__(self):
        self.ollama_url = settings.OLLAMA_URL.rstrip('/')
        self.default_model = settings.OLLAMA_MODEL
        self.code_model = settings.OLLAMA_CODE_MODEL

    # ----------------------------------------------------
    # Availability Check
    # ----------------------------------------------------
    async def is_available(self) -> bool:
        provider = settings.AI_PROVIDER.lower()
        if provider == "gemini" or (provider == "auto" and settings.GEMINI_API_KEY):
            return bool(settings.GEMINI_API_KEY)
        if provider == "nvidia" or (provider == "auto" and settings.NVIDIA_API_KEY):
            return bool(settings.NVIDIA_API_KEY)
        if provider == "openrouter" or (provider == "auto" and settings.OPENROUTER_API_KEY):
            return bool(settings.OPENROUTER_API_KEY)
        if provider == "groq" or (provider == "auto" and settings.GROQ_API_KEY):
            return bool(settings.GROQ_API_KEY)
        
        # Check local Ollama
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.ollama_url}/api/tags")
                return res.status_code == 200
        except Exception:
            return False

    async def get_available_models(self) -> List[str]:
        models = []
        if settings.GEMINI_API_KEY:
            models.append(f"gemini:{settings.GEMINI_MODEL}")
        if settings.NVIDIA_API_KEY:
            models.append(f"nvidia:{settings.NVIDIA_MODEL}")
            models.append(f"nvidia:{settings.NVIDIA_CODE_MODEL}")
        if settings.OPENROUTER_API_KEY:
            models.append(f"openrouter:{settings.OPENROUTER_MODEL}")
        if settings.GROQ_API_KEY:
            models.append(f"groq:{settings.GROQ_MODEL}")
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.ollama_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models.extend([f"ollama:{m.get('name')}" for m in data.get("models", [])])
        except Exception:
            pass
        return models

    # ----------------------------------------------------
    # Google Gemini REST Execution
    # ----------------------------------------------------
    async def _call_gemini(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> Dict[str, Any]:
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set in environment or .env file.")

        target_model = model or settings.GEMINI_MODEL
        if target_model.startswith("models/"):
            target_model = target_model[len("models/"):]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={api_key}"

        payload: Dict[str, Any] = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens
            }
        }

        if system_prompt:
            payload["systemInstruction"] = {
                "parts": [{"text": system_prompt}]
            }

        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code != 200:
                raise RuntimeError(f"Gemini API returned {res.status_code}: {res.text}")
            
            data = res.json()
            candidates = data.get("candidates", [])
            text = ""
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    text = parts[0].get("text", "")

            tokens_used = data.get("usageMetadata", {}).get("totalTokenCount", 0)
            return {
                "text": text,
                "model": f"gemini/{target_model}",
                "done": True,
                "eval_count": tokens_used,
                "provider": "google_gemini"
            }

    async def _chat_gemini(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set in environment or .env file.")

        target_model = model or settings.GEMINI_MODEL
        if target_model.startswith("models/"):
            target_model = target_model[len("models/"):]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={api_key}"

        gemini_contents = []
        for msg in messages:
            role = "model" if msg.get("role") in ["assistant", "model"] else "user"
            gemini_contents.append({
                "role": role,
                "parts": [{"text": msg.get("content", "")}]
            })

        payload = {
            "contents": gemini_contents,
            "generationConfig": {
                "temperature": temperature
            }
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code != 200:
                raise RuntimeError(f"Gemini API returned {res.status_code}: {res.text}")
            
            data = res.json()
            candidates = data.get("candidates", [])
            reply_text = ""
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    reply_text = parts[0].get("text", "")

            tokens_used = data.get("usageMetadata", {}).get("totalTokenCount", 0)
            return {
                "message": {"role": "assistant", "content": reply_text},
                "model": f"gemini/{target_model}",
                "eval_count": tokens_used,
                "provider": "google_gemini"
            }

    # ----------------------------------------------------
    # NVIDIA NIM REST Execution
    # ----------------------------------------------------
    async def _call_nvidia(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> Dict[str, Any]:
        api_key = settings.NVIDIA_API_KEY
        if not api_key:
            raise ValueError("NVIDIA_API_KEY is not set in environment or .env file.")

        target_model = model or settings.NVIDIA_MODEL
        url = f"{settings.NVIDIA_BASE_URL.rstrip('/')}/chat/completions"

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": target_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            if res.status_code != 200:
                raise RuntimeError(f"NVIDIA API returned {res.status_code}: {res.text}")

            data = res.json()
            choices = data.get("choices", [])
            text = choices[0].get("message", {}).get("content", "") if choices else ""
            tokens_used = data.get("usage", {}).get("total_tokens", 0)

            return {
                "text": text,
                "model": f"nvidia/{target_model}",
                "done": True,
                "eval_count": tokens_used,
                "provider": "nvidia_nim"
            }

    async def _chat_nvidia(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        api_key = settings.NVIDIA_API_KEY
        if not api_key:
            raise ValueError("NVIDIA_API_KEY is not set in environment or .env file.")

        target_model = model or settings.NVIDIA_MODEL
        url = f"{settings.NVIDIA_BASE_URL.rstrip('/')}/chat/completions"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": target_model,
            "messages": messages,
            "temperature": temperature
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            if res.status_code != 200:
                raise RuntimeError(f"NVIDIA API returned {res.status_code}: {res.text}")

            data = res.json()
            choices = data.get("choices", [])
            reply_content = choices[0].get("message", {}).get("content", "") if choices else ""
            tokens_used = data.get("usage", {}).get("total_tokens", 0)

            return {
                "message": {"role": "assistant", "content": reply_content},
                "model": f"nvidia/{target_model}",
                "eval_count": tokens_used,
                "provider": "nvidia_nim"
            }

    # ----------------------------------------------------
    # Local Ollama Execution
    # ----------------------------------------------------
    async def _call_ollama(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> Dict[str, Any]:
        target_model = model or self.default_model
        payload = {
            "model": target_model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature, "num_predict": max_tokens}
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
                        "eval_count": data.get("eval_count", 0),
                        "provider": "ollama"
                    }
                raise RuntimeError(f"Ollama returned status {res.status_code}: {res.text}")
        except httpx.ConnectError:
            raise ConnectionError(f"Ollama server is not reachable at {self.ollama_url}.")

    async def _chat_ollama(
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
            "options": {"temperature": temperature}
        }
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                res = await client.post(f"{self.ollama_url}/api/chat", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return {
                        "message": data.get("message", {}),
                        "model": target_model,
                        "eval_count": data.get("eval_count", 0),
                        "provider": "ollama"
                    }
                raise RuntimeError(f"Ollama returned status {res.status_code}: {res.text}")
        except httpx.ConnectError:
            raise ConnectionError(f"Ollama server is not reachable at {self.ollama_url}.")

    # ----------------------------------------------------
    # Unified Public Router with Smart Failover
    # ----------------------------------------------------
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> Dict[str, Any]:
        provider = settings.AI_PROVIDER.lower()

        # 1. Direct provider selection
        if provider == "gemini":
            try:
                return await self._call_gemini(prompt, system_prompt, model, temperature, max_tokens)
            except Exception as e:
                if settings.NVIDIA_API_KEY:
                    return await self._call_nvidia(prompt, system_prompt, None, temperature, max_tokens)
                raise e

        if provider == "nvidia":
            try:
                return await self._call_nvidia(prompt, system_prompt, model, temperature, max_tokens)
            except Exception as e:
                if settings.GEMINI_API_KEY:
                    return await self._call_gemini(prompt, system_prompt, None, temperature, max_tokens)
                raise e

        if provider == "ollama":
            return await self._call_ollama(prompt, system_prompt, model, temperature, max_tokens)

        # 2. 'auto' mode: prefer Gemini (permanent free tier) -> NVIDIA -> Ollama
        if settings.GEMINI_API_KEY:
            try:
                return await self._call_gemini(prompt, system_prompt, model, temperature, max_tokens)
            except Exception as e:
                if settings.NVIDIA_API_KEY:
                    return await self._call_nvidia(prompt, system_prompt, None, temperature, max_tokens)
                raise e

        if settings.NVIDIA_API_KEY:
            return await self._call_nvidia(prompt, system_prompt, model, temperature, max_tokens)

        # Fallback to local Ollama if no cloud keys configured
        try:
            return await self._call_ollama(prompt, system_prompt, model, temperature, max_tokens)
        except Exception:
            raise RuntimeError(
                "No free AI provider is configured. Please add GEMINI_API_KEY (from https://aistudio.google.com) "
                "or NVIDIA_API_KEY (from https://build.nvidia.com) in your .env file, or launch local Ollama."
            )

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        provider = settings.AI_PROVIDER.lower()

        if provider == "gemini":
            try:
                return await self._chat_gemini(messages, model, temperature)
            except Exception as e:
                if settings.NVIDIA_API_KEY:
                    return await self._chat_nvidia(messages, None, temperature)
                raise e

        if provider == "nvidia":
            try:
                return await self._chat_nvidia(messages, model, temperature)
            except Exception as e:
                if settings.GEMINI_API_KEY:
                    return await self._chat_gemini(messages, None, temperature)
                raise e

        if provider == "ollama":
            return await self._chat_ollama(messages, model, temperature)

        # Auto mode
        if settings.GEMINI_API_KEY:
            try:
                return await self._chat_gemini(messages, model, temperature)
            except Exception as e:
                if settings.NVIDIA_API_KEY:
                    return await self._chat_nvidia(messages, None, temperature)
                raise e

        if settings.NVIDIA_API_KEY:
            return await self._chat_nvidia(messages, model, temperature)

        try:
            return await self._chat_ollama(messages, model, temperature)
        except Exception:
            raise RuntimeError(
                "No free AI provider is configured. Please add GEMINI_API_KEY or NVIDIA_API_KEY in your .env file."
            )

llm_service = LanguageModelService()
