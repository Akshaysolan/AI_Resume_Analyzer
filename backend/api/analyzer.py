"""
analyzer.py  —  AI Resume Analysis Engine
Supports: groq | gemini | openrouter   (set AI_PROVIDER in backend/.env)

FIX: prompt now uses numbered placeholders instead of angle-bracket tokens
     so the model never produces angle-bracket chars that break JSON.
"""

import json
import re
import requests
from django.conf import settings


# ── Prompt uses ONLY safe JSON-compatible placeholder text ────────────────────
ANALYSIS_SYSTEM_PROMPT = """You are an expert professional resume analyst and career coach with 15+ years of experience.

Analyse the resume provided by the user and respond with ONLY a valid JSON object.
No markdown fences, no explanation, no text before or after the JSON.

Use this exact JSON structure (replace every description in parentheses with real values):

{
  "overall_score": 0,
  "grade": "B",
  "summary": "Write 2-3 sentences here.",
  "candidate_name": "Full name here",
  "contact_info": {
    "email": "email or null",
    "phone": "phone or null",
    "linkedin": "url or null",
    "location": "city or null"
  },
  "sections": {
    "contact":      {"score": 0, "status": "good", "feedback": "Write feedback here."},
    "summary":      {"score": 0, "status": "good", "feedback": "Write feedback here."},
    "experience":   {"score": 0, "status": "good", "feedback": "Write feedback here."},
    "education":    {"score": 0, "status": "good", "feedback": "Write feedback here."},
    "skills":       {"score": 0, "status": "good", "feedback": "Write feedback here."},
    "achievements": {"score": 0, "status": "good", "feedback": "Write feedback here."}
  },
  "strengths": ["strength one", "strength two", "strength three", "strength four", "strength five"],
  "improvements": [
    {"priority": "high",   "title": "Title here", "description": "Description here.", "example": "Example here."},
    {"priority": "high",   "title": "Title here", "description": "Description here.", "example": "Example here."},
    {"priority": "medium", "title": "Title here", "description": "Description here.", "example": "Example here."},
    {"priority": "medium", "title": "Title here", "description": "Description here.", "example": "Example here."},
    {"priority": "low",    "title": "Title here", "description": "Description here.", "example": "Example here."}
  ],
  "skills_found":   ["skill1", "skill2", "skill3"],
  "skills_missing": ["skill1", "skill2", "skill3"],
  "keywords": {
    "present":   ["keyword1", "keyword2"],
    "suggested": ["keyword1", "keyword2"]
  },
  "ats_score": 0,
  "ats_issues": ["issue one", "issue two"],
  "experience_years": 0,
  "career_level": "mid",
  "industry": "Software Engineering",
  "job_titles": ["Most recent title"],
  "job_match": {
    "score": null,
    "matched_keywords": [],
    "missing_keywords": [],
    "recommendation": null
  },
  "action_plan": [
    {"step": 1, "action": "Action description here.", "timeframe": "Today"},
    {"step": 2, "action": "Action description here.", "timeframe": "This week"},
    {"step": 3, "action": "Action description here.", "timeframe": "This week"},
    {"step": 4, "action": "Action description here.", "timeframe": "This month"},
    {"step": 5, "action": "Action description here.", "timeframe": "This month"}
  ]
}

Rules:
- Replace every placeholder string with real analysis content.
- All score fields must be integers 0-100.
- overall_score and ats_score must be integers.
- experience_years must be an integer or null.
- career_level must be one of: entry, junior, mid, senior, lead, executive.
- status fields must be one of: excellent, good, needs_work, missing.
- job_match.score is null if no job description was provided.
- Do NOT include any text outside the JSON object.
- Do NOT use markdown code fences.
"""


def _extract_json(text: str) -> dict:
    """
    Robustly extract JSON from model response.
    Handles: ```json fences, leading/trailing text, minor escaping issues.
    """
    text = text.strip()

    # Remove markdown fences
    text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s*```\s*$', '', text, flags=re.MULTILINE)
    text = text.strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Find the outermost { } block
    start = text.find('{')
    end   = text.rfind('}')
    if start != -1 and end > start:
        candidate = text[start:end+1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError as e:
            # Last resort: remove control characters and retry
            candidate = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', candidate)
            try:
                return json.loads(candidate)
            except json.JSONDecodeError as e2:
                raise ValueError(
                    f"AI returned invalid JSON: {e2}\n"
                    f"Raw snippet: {candidate[:300]}"
                ) from e2

    raise ValueError("No JSON object found in AI response.")


def _build_content(resume_text: str, job_description: str) -> str:
    content = f"RESUME:\n{resume_text.strip()}"
    if job_description.strip():
        content += f"\n\nJOB DESCRIPTION:\n{job_description.strip()}"
    return content


# ── GROQ ──────────────────────────────────────────────────────────────────────
def _analyze_groq(resume_text: str, job_description: str) -> dict:
    api_key = getattr(settings, "GROQ_API_KEY", "").strip()
    if not api_key:
        raise ValueError("GROQ_API_KEY not set in backend/.env")

    resp = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type":  "application/json",
            "User-Agent":    "ResumeIQ/1.0",
        },
        json={
            "model":       "llama-3.3-70b-versatile",
            "temperature": 0.1,
            "max_tokens":  4096,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                {"role": "user",   "content": _build_content(resume_text, job_description)},
            ],
        },
        timeout=90,
    )

    if not resp.ok:
        raise RuntimeError(f"Groq API {resp.status_code}: {resp.text[:400]}")

    raw = resp.json()["choices"][0]["message"]["content"]
    print(f"[ResumeIQ] Groq OK — raw[:120]: {raw[:120]}")
    return _extract_json(raw)


# ── GEMINI ────────────────────────────────────────────────────────────────────
def _analyze_gemini(resume_text: str, job_description: str) -> dict:
    api_key = getattr(settings, "GEMINI_API_KEY", "").strip()
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in backend/.env")

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.0-flash:generateContent?key={api_key}"
    )

    resp = requests.post(
        url,
        headers={"Content-Type": "application/json", "User-Agent": "ResumeIQ/1.0"},
        json={
            "system_instruction": {"parts": [{"text": ANALYSIS_SYSTEM_PROMPT}]},
            "contents": [{"role": "user", "parts": [{"text": _build_content(resume_text, job_description)}]}],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 4096,
                "responseMimeType": "application/json",
            },
        },
        timeout=90,
    )

    if not resp.ok:
        raise RuntimeError(f"Gemini API {resp.status_code}: {resp.text[:400]}")

    raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    print(f"[ResumeIQ] Gemini OK — raw[:120]: {raw[:120]}")
    return _extract_json(raw)


# ── OPENROUTER ────────────────────────────────────────────────────────────────
def _analyze_openrouter(resume_text: str, job_description: str) -> dict:
    api_key = getattr(settings, "OPENROUTER_API_KEY", "").strip()
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not set in backend/.env")

    model = getattr(settings, "OPENROUTER_MODEL", "mistralai/mistral-7b-instruct:free")

    resp = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type":  "application/json",
            "HTTP-Referer":  "https://resumeiq.app",
            "X-Title":       "ResumeIQ",
            "User-Agent":    "ResumeIQ/1.0",
        },
        json={
            "model":       model,
            "temperature": 0.1,
            "max_tokens":  4096,
            "messages": [
                {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                {"role": "user",   "content": _build_content(resume_text, job_description)},
            ],
        },
        timeout=90,
    )

    if not resp.ok:
        raise RuntimeError(f"OpenRouter API {resp.status_code}: {resp.text[:400]}")

    raw = resp.json()["choices"][0]["message"]["content"]
    print(f"[ResumeIQ] OpenRouter OK — raw[:120]: {raw[:120]}")
    return _extract_json(raw)


# ── PUBLIC ENTRY POINT ────────────────────────────────────────────────────────
def analyze_resume(resume_text: str, job_description: str = "") -> dict:
    """
    Set AI_PROVIDER in backend/.env:
        AI_PROVIDER=groq        (recommended — free, fast, supports json_object mode)
        AI_PROVIDER=gemini      (free)
        AI_PROVIDER=openrouter  (free models)
    """
    provider = getattr(settings, "AI_PROVIDER", "groq").lower().strip()
    print(f"[ResumeIQ] provider='{provider}'")

    if provider == "groq":
        return _analyze_groq(resume_text, job_description)
    elif provider == "gemini":
        return _analyze_gemini(resume_text, job_description)
    elif provider == "openrouter":
        return _analyze_openrouter(resume_text, job_description)
    else:
        raise ValueError(f"Unknown AI_PROVIDER='{provider}'. Use: groq | gemini | openrouter")
