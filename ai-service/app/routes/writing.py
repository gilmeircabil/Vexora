import json
from fastapi import APIRouter, HTTPException, Body
from typing import Optional, Dict, Any
from app.services.language_model import llm_service

router = APIRouter(prefix="/writing", tags=["Writing AI"])

@router.post("/assist")
async def writing_assistant(payload: Dict[str, Any] = Body(...)):
    """
    Modes: rewrite, fix_grammar, simplify, expand, tone_professional, tone_casual, summarize, bullet_points
    """
    text = payload.get("text", "")
    mode = payload.get("mode", "rewrite")
    target_tone = payload.get("tone", "professional")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    prompts = {
        "rewrite": f"Rewrite the following text to make it clear, compelling, and engaging in a {target_tone} tone.",
        "fix_grammar": "Correct all grammar, spelling, punctuation, and phrasing errors in the following text while preserving original meaning. Only output the corrected version.",
        "simplify": "Simplify the following text so that it is easy to read, direct, and free of unnecessary jargon.",
        "expand": "Elaborate and expand upon the ideas in the following text with relevant context, supporting points, and clarity.",
        "summarize": "Condense the following text into a clear, concise summary covering all key thoughts.",
        "tone_professional": "Rewrite the text with an authoritative, polished, professional business tone.",
        "tone_casual": "Rewrite the text in a friendly, conversational, and approachable tone.",
        "bullet_points": "Convert the main points of the following text into well-formatted bullet points."
    }

    instruction = prompts.get(mode, prompts["rewrite"])
    system_prompt = "You are ToolNest Writing Assistant, an elite editor and copywriter. Return only the revised text without meta comments."
    user_prompt = f"{instruction}\n\nOriginal Text:\n{text}\n\nRevised:"

    try:
        res = await llm_service.generate(prompt=user_prompt, system_prompt=system_prompt, temperature=0.6)
        return {
            "result": res.get("text", "").strip(),
            "mode": mode,
            "original_length": len(text),
            "result_length": len(res.get("text", "")),
            "model": res.get("model")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resume")
async def resume_builder(payload: Dict[str, Any] = Body(...)):
    """
    Takes target role and resume sections, returns ATS-optimized bullet points,
    executive summary, and highlighted skill keywords.
    """
    target_role = payload.get("target_role", "Software Engineer")
    summary = payload.get("summary", "")
    experience = payload.get("experience", [])
    skills = payload.get("skills", [])

    system_prompt = (
        "You are an executive career coach and ATS optimization specialist. "
        "Return a JSON object with: 'professional_summary' (compelling 3-4 sentence pitch), "
        "'enhanced_experience' (array of job entries with action-driven XYZ formula bullet points: 'Accomplished [X] as measured by [Y], by doing [Z]'), "
        "and 'recommended_keywords' (list of high-value industry skills for this role)."
    )

    user_prompt = (
        f"Target Role: {target_role}\n"
        f"Current Summary: {summary}\n"
        f"Current Experience: {json.dumps(experience)}\n"
        f"Current Skills: {json.dumps(skills)}\n\n"
        "Return strictly valid JSON without markdown wrapping."
    )

    try:
        res = await llm_service.generate(prompt=user_prompt, system_prompt=system_prompt, temperature=0.5)
        raw_text = res.get("text", "").strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        data = json.loads(raw_text.strip())
        return {
            "target_role": target_role,
            "optimized_resume": data,
            "model": res.get("model")
        }
    except Exception as e:
        # Fallback structured response if parsing fails or LLM is offline
        return {
            "target_role": target_role,
            "optimized_resume": {
                "professional_summary": f"Results-driven {target_role} with proven expertise in delivering scalable solutions and driving project excellence.",
                "enhanced_experience": experience,
                "recommended_keywords": skills + ["Cross-functional Collaboration", "Performance Optimization", "Agile Methodologies"]
            },
            "error_detail": str(e)
        }
