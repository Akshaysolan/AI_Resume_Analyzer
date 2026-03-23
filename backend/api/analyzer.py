"""
analyzer.py  —  AI Resume Analysis Engine
Supports: groq | gemini | openrouter   (set AI_PROVIDER in backend/.env)
"""

import json
import re
import requests
from django.conf import settings


ANALYSIS_SYSTEM_PROMPT = """You are a strict, honest, and highly experienced professional resume reviewer with 15+ years in HR, recruiting, and talent acquisition across multiple industries.

Your job is to critically and accurately evaluate the resume provided. You must give REAL scores based on actual resume quality.

SCORING GUIDE:
- Weak resume with no quantified achievements: score 30-50
- Average resume: score 50-70
- Good resume: score 70-85
- Excellent resume: score 85-95
- Near-perfect resume: score 95-100

SCORING CRITERIA (total 100 points):
- Contact info completeness: 5 points
- Professional summary quality: 10 points
- Experience depth and quantified achievements: 30 points
- Skills relevance and organization: 20 points
- Education details: 15 points
- ATS optimization and keywords: 10 points
- Formatting and structure: 10 points

DEDUCT points for:
- Missing quantified achievements: -15
- No professional summary: -10
- Missing LinkedIn or GitHub: -5
- No certifications for technical roles: -5
- Vague bullet points: -10
- Missing key industry keywords: -10
- Short work experience: -10
- No projects section for freshers: -10

IMPORTANT RULES:
1. Never default to scores between 80-90 unless genuinely deserved
2. Most entry-level resumes score 40-65
3. Most mid-level resumes score 55-75
4. Only exceptional resumes score above 85
5. Be specific in feedback, mention actual content from the resume
6. Never give the same score to every resume

Respond with ONLY a valid JSON object. No markdown fences. No text before or after the JSON.

The JSON must have exactly these fields with these exact value types:

overall_score: integer between 0 and 100
grade: string, one of "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"
summary: string with 2-3 honest sentences about the candidate
candidate_name: string with full name or "Not Found"
contact_info: object with email, phone, linkedin, location as strings or null
sections: object with contact, summary, experience, education, skills, achievements - each having score integer, status string, feedback string
strengths: array of 5 strings describing genuine strengths
improvements: array of 5 objects each with priority string, title string, description string, example string
skills_found: array of strings listing every skill found
skills_missing: array of strings listing important missing skills
keywords: object with present array and suggested array of strings
ats_score: integer between 0 and 100
ats_issues: array of strings describing ATS problems
experience_years: integer or null
career_level: string, one of "entry", "junior", "mid", "senior", "lead", "executive"
industry: string describing primary industry
job_titles: array of strings
job_match: object with score as null, matched_keywords as empty array, missing_keywords as empty array, recommendation as null
action_plan: array of 5 objects each with step integer, action string, timeframe string

For status fields use only: excellent, good, needs_work, or missing
For priority fields use only: high, medium, or low
For timeframe fields use only: Today, This week, or This month
"""


def _extract_json(text: str) -> dict:
    """Robustly extract JSON from model response."""
    text = text.strip()

    # Remove markdown fences
    text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s*```\s*$', '', text, flags=re.MULTILINE)
    text = text.strip()

    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Find JSON object boundaries
    start = text.find('{')
    end   = text.rfind('}')
    if start != -1 and end > start:
        candidate = text[start:end+1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            candidate = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', candidate)
            try:
                return json.loads(candidate)
            except json.JSONDecodeError as e:
                raise ValueError(f"AI returned invalid JSON: {e}\nRaw: {candidate[:300]}") from e

    raise ValueError("No JSON object found in AI response.")


def _build_content(resume_text: str, job_description: str) -> str:
    content = f"Please analyze this resume:\n\n{resume_text.strip()}"
    if job_description.strip():
        content += f"\n\nJob Description to match against:\n{job_description.strip()}"
        content += "\n\nSince a job description is provided, fill in job_match.score, job_match.matched_keywords, job_match.missing_keywords, and job_match.recommendation."
    return content


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
            "temperature": 0.3,
            "max_tokens":  4096,
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
    print(f"[ResumeIQ] Groq response received, length={len(raw)}")
    return _extract_json(raw)


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
                "temperature": 0.3,
                "maxOutputTokens": 4096,
                "responseMimeType": "application/json",
            },
        },
        timeout=90,
    )

    if not resp.ok:
        raise RuntimeError(f"Gemini API {resp.status_code}: {resp.text[:400]}")

    raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    return _extract_json(raw)


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
            "temperature": 0.3,
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
    return _extract_json(raw)


def analyze_resume(resume_text: str, job_description: str = "") -> dict:
    """
    Set AI_PROVIDER in backend/.env:
        AI_PROVIDER=groq        (recommended)
        AI_PROVIDER=gemini
        AI_PROVIDER=openrouter
    """
    provider = getattr(settings, "AI_PROVIDER", "groq").lower().strip()
    print(f"[ResumeIQ] provider='{provider}' | resume length={len(resume_text)} chars")

    if provider == "groq":
        result = _analyze_groq(resume_text, job_description)
    elif provider == "gemini":
        result = _analyze_gemini(resume_text, job_description)
    elif provider == "openrouter":
        result = _analyze_openrouter(resume_text, job_description)
    else:
        raise ValueError(f"Unknown AI_PROVIDER='{provider}'. Use: groq | gemini | openrouter")

    # Validate and clamp score
    score = result.get("overall_score", 0)
    try:
        score = max(0, min(100, int(score)))
    except Exception:
        score = 50
    result["overall_score"] = score

    # Recalculate grade from actual score
    s = score
    if   s >= 95: result["grade"] = "A+"
    elif s >= 90: result["grade"] = "A"
    elif s >= 85: result["grade"] = "A-"
    elif s >= 80: result["grade"] = "B+"
    elif s >= 75: result["grade"] = "B"
    elif s >= 70: result["grade"] = "B-"
    elif s >= 65: result["grade"] = "C+"
    elif s >= 60: result["grade"] = "C"
    elif s >= 55: result["grade"] = "C-"
    elif s >= 40: result["grade"] = "D"
    else:         result["grade"] = "F"

    print(f"[ResumeIQ] Final score={result['overall_score']} grade={result['grade']}")
    return result