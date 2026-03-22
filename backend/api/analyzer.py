"""
analyzer.py  —  AI Resume Analysis Engine
Supports: groq | gemini | openrouter   (set AI_PROVIDER in backend/.env)
"""

import json
import re
import requests
from django.conf import settings


ANALYSIS_SYSTEM_PROMPT = """You are a strict, honest, and highly experienced professional resume reviewer with 15+ years in HR, recruiting, and talent acquisition across multiple industries.

Your job is to critically and accurately evaluate the resume provided. You must:
- Give REAL scores based on actual resume quality — do NOT default to 70-85
- A weak resume with no quantified achievements should score 30-50
- An average resume scores 50-70
- A good resume scores 70-85
- An excellent resume scores 85-95
- A near-perfect resume scores 95-100
- Be STRICT — most resumes have significant flaws

SCORING CRITERIA for overall_score:
- Contact info completeness (5 points)
- Professional summary quality (10 points)  
- Experience depth and quantified achievements (30 points)
- Skills relevance and organization (20 points)
- Education details (15 points)
- ATS optimization and keywords (10 points)
- Formatting and structure (10 points)

Deduct points for:
- Missing quantified achievements (-15)
- No professional summary (-10)
- Missing LinkedIn/GitHub (-5)
- No certifications for technical roles (-5)
- Vague bullet points (-10)
- Missing key industry keywords (-10)
- Short work experience (-10)
- No projects section for freshers (-10)

Respond with ONLY a valid JSON object. No markdown, no explanation, no text outside JSON.

{
  "overall_score": <Calculate strictly based on criteria above. INTEGER 0-100>,
  "grade": "<A+ for 95-100, A for 90-94, A- for 85-89, B+ for 80-84, B for 75-79, B- for 70-74, C+ for 65-69, C for 60-64, C- for 55-59, D for 40-54, F for 0-39>",
  "summary": "<Write 2-3 honest sentences about the candidate's profile, strengths and weaknesses>",
  "candidate_name": "<Extract full name from resume, or Not Found>",
  "contact_info": {
    "email": "<email address or null>",
    "phone": "<phone number or null>",
    "linkedin": "<linkedin URL or null>",
    "location": "<city and country or null>"
  },
  "sections": {
    "contact":      {"score": <0-100 based on completeness>, "status": "<excellent|good|needs_work|missing>", "feedback": "<specific honest feedback>"},
    "summary":      {"score": <0-100>, "status": "<excellent|good|needs_work|missing>", "feedback": "<specific honest feedback>"},
    "experience":   {"score": <0-100 based on depth, achievements, quantification>, "status": "<excellent|good|needs_work|missing>", "feedback": "<specific honest feedback>"},
    "education":    {"score": <0-100>, "status": "<excellent|good|needs_work|missing>", "feedback": "<specific honest feedback>"},
    "skills":       {"score": <0-100 based on relevance and organization>, "status": "<excellent|good|needs_work|missing>", "feedback": "<specific honest feedback>"},
    "achievements": {"score": <0-100 based on quantified results>, "status": "<excellent|good|needs_work|missing>", "feedback": "<specific honest feedback>"}
  },
  "strengths": [
    "<Genuine strength 1 found in this specific resume>",
    "<Genuine strength 2>",
    "<Genuine strength 3>",
    "<Genuine strength 4>",
    "<Genuine strength 5>"
  ],
  "improvements": [
    {"priority": "high",   "title": "<Critical issue title>", "description": "<Detailed description of the problem>", "example": "<Concrete example of how to fix it>"},
    {"priority": "high",   "title": "<Critical issue title>", "description": "<Detailed description>", "example": "<Concrete fix example>"},
    {"priority": "medium", "title": "<Important issue>",      "description": "<Detailed description>", "example": "<Concrete fix example>"},
    {"priority": "medium", "title": "<Important issue>",      "description": "<Detailed description>", "example": "<Concrete fix example>"},
    {"priority": "low",    "title": "<Minor issue>",          "description": "<Detailed description>", "example": "<Concrete fix example>"}
  ],
  "skills_found":   ["<List every technical and soft skill actually found in the resume>"],
  "skills_missing": ["<List important skills missing for this type of role>"],
  "keywords": {
    "present":   ["<Keywords found in the resume>"],
    "suggested": ["<Important keywords missing that recruiters search for>"]
  },
  "ats_score": <INTEGER 0-100. Deduct for: missing keywords, graphics, tables, non-standard formatting, missing contact info>,
  "ats_issues": ["<Specific ATS issue 1>", "<Specific ATS issue 2>", "<Specific ATS issue 3>"],
  "experience_years": <Total years of work experience as INTEGER, or 0 for fresher, or null if unclear>,
  "career_level": "<entry for 0-1yr, junior for 1-3yr, mid for 3-6yr, senior for 6-10yr, lead for 10-15yr, executive for 15yr+>",
  "industry": "<Primary industry detected from resume>",
  "job_titles": ["<Most recent or target job title>"],
  "job_match": {
    "score": null,
    "matched_keywords": [],
    "missing_keywords": [],
    "recommendation": null
  },
  "action_plan": [
    {"step": 1, "action": "<Most critical specific action to improve this resume>", "timeframe": "Today"},
    {"step": 2, "action": "<Second most important action>", "timeframe": "Today"},
    {"step": 3, "action": "<Third action>", "timeframe": "This week"},
    {"step": 4, "action": "<Fourth action>", "timeframe": "This week"},
    {"step": 5, "action": "<Fifth action>", "timeframe": "This month"}
  ]
}

IMPORTANT SCORING RULES:
1. Never give overall_score between 80-90 unless the resume genuinely deserves it
2. Most entry-level resumes score 40-65
3. Most mid-level resumes score 55-75
4. Only exceptional resumes score above 85
5. Calculate the score mathematically using the criteria above
6. Each section score must reflect the actual quality of that section
7. Be specific in feedback — mention actual content from the resume
8. Never give the same score to every resume — scores must vary based on quality
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
            # Remove control characters and retry
            candidate = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', candidate)
            try:
                return json.loads(candidate)
            except json.JSONDecodeError as e:
                raise ValueError(f"AI returned invalid JSON: {e}\nRaw: {candidate[:300]}") from e

    raise ValueError("No JSON object found in AI response.")


def _build_content(resume_text: str, job_description: str) -> str:
    content = f"RESUME TO ANALYZE:\n\n{resume_text.strip()}"
    if job_description.strip():
        content += f"\n\n---JOB DESCRIPTION---\n{job_description.strip()}"
        content += "\n\nNOTE: Since a job description is provided, also fill in the job_match section with score, matched_keywords, missing_keywords, and recommendation."
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
    print(f"[ResumeIQ] Groq OK — score in response: {raw[raw.find('overall_score'):raw.find('overall_score')+30]}")
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

    # Validate and clamp scores to prevent hallucinated values
    score = result.get("overall_score", 0)
    if not isinstance(score, int) or score < 0 or score > 100:
        try:
            score = max(0, min(100, int(score)))
            result["overall_score"] = score
        except Exception:
            result["overall_score"] = 50

    # Recalculate grade from actual score
    s = result["overall_score"]
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