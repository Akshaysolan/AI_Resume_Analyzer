"""
analyzer.py  —  AI Resume Analysis Engine
Supports: groq | gemini | openrouter   (set AI_PROVIDER in backend/.env)
"""

import json
import re
import requests
from django.conf import settings


ANALYSIS_SYSTEM_PROMPT = """You are ResumeIQ, a world-class professional resume analyst with 20 years of experience in HR, talent acquisition, and career coaching across Software Engineering, Data Science, Product, Design, Marketing, Finance, and other industries.

You analyze resumes with the precision of a senior recruiter at a top tech company. Your feedback is honest, specific, actionable, and proportional to the actual quality of the resume.

PROPORTIONAL SCORING SYSTEM:
You MUST calculate the score mathematically based on the resume content. Do not guess or default to any fixed score.

Start with 100 points and subtract:

CONTACT SECTION (max deduct 15):
- Missing email: -5
- Missing phone: -5
- Missing LinkedIn: -3
- Missing location: -2

PROFESSIONAL SUMMARY (max deduct 15):
- No summary section at all: -15
- Summary exists but is generic or vague: -8
- Summary exists but lacks keywords: -4

EXPERIENCE SECTION (max deduct 35):
- No work experience at all: -35
- Less than 1 year experience: -20
- Experience exists but no quantified achievements (no numbers, metrics, percentages): -15
- Only 1 job listed: -8
- Bullet points are vague (e.g. "worked on projects", "helped team"): -10
- Job descriptions are too short (less than 3 bullets per role): -5

SKILLS SECTION (max deduct 15):
- No skills section: -15
- Skills listed but not categorized: -5
- Missing key technical skills for their role: -8
- Only soft skills, no technical skills: -10

EDUCATION SECTION (max deduct 10):
- No education listed: -10
- Education listed but no GPA or achievements: -3
- Degree not relevant to listed experience: -2

PROJECTS SECTION (max deduct 10):
- Fresher (0-1 yr exp) with no projects: -10
- Projects listed but no tech stack mentioned: -5
- Projects with no description of impact: -4

CERTIFICATIONS (max deduct 5):
- Technical role with no certifications: -5

ATS SCORE is separate and based on:
- Keyword density (industry-specific terms)
- Clean formatting (no tables, no graphics in text)
- Standard section headings
- Contact info in header
- Proper date formats

GRADE SCALE:
95-100 = A+  (exceptional, ready to submit anywhere)
90-94  = A   (excellent, minor polish needed)
85-89  = A-  (very good, small improvements)
80-84  = B+  (good, some gaps to address)
75-79  = B   (above average, noticeable improvements needed)
70-74  = B-  (average professional resume)
65-69  = C+  (below average, significant work needed)
60-64  = C   (weak resume, major improvements required)
55-59  = C-  (poor, needs complete rework)
40-54  = D   (very poor, barely usable)
0-39   = F   (not suitable, start over)

RESPONSE FORMAT:
Respond with ONLY a raw JSON object. No markdown. No backticks. No explanation. Start directly with the opening brace.

Required JSON structure:

{
  "overall_score": 72,
  "grade": "B-",
  "summary": "Two to three honest sentences describing the candidate profile, key strengths, and primary weaknesses.",
  "candidate_name": "Full Name or Not Found",
  "contact_info": {
    "email": "email or null",
    "phone": "phone or null",
    "linkedin": "url or null",
    "location": "city country or null"
  },
  "sections": {
    "contact": {
      "score": 80,
      "status": "good",
      "feedback": "Specific feedback about the contact section."
    },
    "summary": {
      "score": 65,
      "status": "needs_work",
      "feedback": "Specific feedback about the summary section."
    },
    "experience": {
      "score": 70,
      "status": "good",
      "feedback": "Specific feedback about experience with mention of actual job titles."
    },
    "education": {
      "score": 85,
      "status": "excellent",
      "feedback": "Specific feedback about education."
    },
    "skills": {
      "score": 75,
      "status": "good",
      "feedback": "Specific feedback about skills section."
    },
    "achievements": {
      "score": 50,
      "status": "needs_work",
      "feedback": "Specific feedback about quantified achievements or lack thereof."
    }
  },
  "strengths": [
    "Specific strength found in this resume",
    "Another specific strength",
    "Third specific strength",
    "Fourth specific strength",
    "Fifth specific strength"
  ],
  "improvements": [
    {
      "priority": "high",
      "title": "Add Quantified Achievements",
      "description": "Specific description of the problem found in this resume.",
      "example": "Concrete example of how to fix it with actual numbers or wording."
    },
    {
      "priority": "high",
      "title": "Second Critical Issue",
      "description": "Specific description.",
      "example": "Concrete fix example."
    },
    {
      "priority": "medium",
      "title": "Third Issue",
      "description": "Specific description.",
      "example": "Concrete fix example."
    },
    {
      "priority": "medium",
      "title": "Fourth Issue",
      "description": "Specific description.",
      "example": "Concrete fix example."
    },
    {
      "priority": "low",
      "title": "Minor Polish",
      "description": "Specific description.",
      "example": "Concrete fix example."
    }
  ],
  "skills_found": ["skill1", "skill2", "skill3"],
  "skills_missing": ["missing_skill1", "missing_skill2", "missing_skill3"],
  "keywords": {
    "present": ["keyword1", "keyword2"],
    "suggested": ["suggested1", "suggested2"]
  },
  "ats_score": 68,
  "ats_issues": [
    "Specific ATS issue 1",
    "Specific ATS issue 2",
    "Specific ATS issue 3"
  ],
  "experience_years": 2,
  "career_level": "junior",
  "industry": "Software Engineering",
  "job_titles": ["Most Recent Job Title"],
  "job_match": {
    "score": null,
    "matched_keywords": [],
    "missing_keywords": [],
    "recommendation": null
  },
  "action_plan": [
    {
      "step": 1,
      "action": "Most critical specific action for this resume",
      "timeframe": "Today"
    },
    {
      "step": 2,
      "action": "Second most important action",
      "timeframe": "Today"
    },
    {
      "step": 3,
      "action": "Third action",
      "timeframe": "This week"
    },
    {
      "step": 4,
      "action": "Fourth action",
      "timeframe": "This week"
    },
    {
      "step": 5,
      "action": "Fifth action",
      "timeframe": "This month"
    }
  ]
}

STRICT RULES:
1. overall_score MUST be calculated mathematically using the deduction system above
2. Do NOT default to 72 or any other fixed number — calculate from the actual resume
3. section scores must individually reflect the quality of each section
4. strengths must mention specific things from this resume, not generic phrases
5. improvements must reference actual problems found in this specific resume
6. skills_found must list every skill mentioned anywhere in the resume
7. career_level must match experience_years exactly
8. status values must be one of exactly: excellent, good, needs_work, missing
9. priority values must be one of exactly: high, medium, low
10. timeframe values must be one of exactly: Today, This week, This month
11. If job description is not provided, job_match.score must be null
"""


def _extract_json(text: str) -> dict:
    """Robustly extract and parse JSON from AI response."""
    text = text.strip()

    # Strip markdown fences if present
    text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s*```\s*$',       '', text, flags=re.MULTILINE)
    text = text.strip()

    # Attempt 1: direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Attempt 2: find outermost { }
    start = text.find('{')
    end   = text.rfind('}')
    if start != -1 and end > start:
        candidate = text[start:end + 1]

        # Attempt 3: parse the extracted block
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

        # Attempt 4: remove control characters then parse
        candidate = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', candidate)
        try:
            return json.loads(candidate)
        except json.JSONDecodeError as e:
            raise ValueError(
                f"AI returned invalid JSON after all recovery attempts.\n"
                f"Error: {e}\n"
                f"First 400 chars: {candidate[:400]}"
            ) from e

    raise ValueError("No JSON object found in AI response.")


def _validate_result(result: dict) -> dict:
    """Validate and sanitise the result to prevent frontend crashes."""

    # Clamp overall_score
    try:
        score = max(0, min(100, int(result.get("overall_score", 50))))
    except (TypeError, ValueError):
        score = 50
    result["overall_score"] = score

    # Recalculate grade from actual score
    grade_map = [
        (95, "A+"), (90, "A"), (85, "A-"), (80, "B+"),
        (75, "B"),  (70, "B-"),(65, "C+"), (60, "C"),
        (55, "C-"), (40, "D"),
    ]
    grade = "F"
    for threshold, g in grade_map:
        if score >= threshold:
            grade = g
            break
    result["grade"] = grade

    # Ensure required keys exist with safe defaults
    result.setdefault("summary",        "Analysis complete.")
    result.setdefault("candidate_name", "Not Found")
    result.setdefault("contact_info",   {"email": None, "phone": None, "linkedin": None, "location": None})
    result.setdefault("strengths",      [])
    result.setdefault("improvements",   [])
    result.setdefault("skills_found",   [])
    result.setdefault("skills_missing", [])
    result.setdefault("keywords",       {"present": [], "suggested": []})
    result.setdefault("ats_score",      50)
    result.setdefault("ats_issues",     [])
    result.setdefault("experience_years", None)
    result.setdefault("career_level",   "mid")
    result.setdefault("industry",       "General")
    result.setdefault("job_titles",     [])
    result.setdefault("job_match",      {"score": None, "matched_keywords": [], "missing_keywords": [], "recommendation": None})
    result.setdefault("action_plan",    [])

    # Clamp ats_score
    try:
        result["ats_score"] = max(0, min(100, int(result["ats_score"])))
    except (TypeError, ValueError):
        result["ats_score"] = 50

    # Ensure sections exist
    default_section = {"score": 50, "status": "needs_work", "feedback": "No data available."}
    sections = result.get("sections", {})
    for key in ["contact", "summary", "experience", "education", "skills", "achievements"]:
        sections.setdefault(key, default_section.copy())
        # Clamp section scores
        try:
            sections[key]["score"] = max(0, min(100, int(sections[key].get("score", 50))))
        except (TypeError, ValueError):
            sections[key]["score"] = 50
    result["sections"] = sections

    print(f"[ResumeIQ] Validated — score={score} grade={grade} ats={result['ats_score']}")
    return result


def _build_content(resume_text: str, job_description: str) -> str:
    content = f"RESUME TO ANALYZE:\n\n{resume_text.strip()}"
    if job_description.strip():
        content += (
            f"\n\nJOB DESCRIPTION TO MATCH:\n{job_description.strip()}"
            "\n\nIMPORTANT: Since a job description is provided, calculate and fill in "
            "job_match.score (0-100), job_match.matched_keywords, "
            "job_match.missing_keywords, and job_match.recommendation."
        )
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
            "temperature": 0.2,
            "max_tokens":  4096,
            "messages": [
                {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                {"role": "user",   "content": _build_content(resume_text, job_description)},
            ],
        },
        timeout=90,
    )

    if not resp.ok:
        raise RuntimeError(f"Groq API {resp.status_code}: {resp.text[:500]}")

    raw = resp.json()["choices"][0]["message"]["content"]
    print(f"[ResumeIQ] Groq responded — {len(raw)} chars")
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
            "contents": [
                {"role": "user", "parts": [{"text": _build_content(resume_text, job_description)}]}
            ],
            "generationConfig": {
                "temperature":      0.2,
                "maxOutputTokens":  4096,
                "responseMimeType": "application/json",
            },
        },
        timeout=90,
    )

    if not resp.ok:
        raise RuntimeError(f"Gemini API {resp.status_code}: {resp.text[:500]}")

    raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    print(f"[ResumeIQ] Gemini responded — {len(raw)} chars")
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
            "temperature": 0.2,
            "max_tokens":  4096,
            "messages": [
                {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                {"role": "user",   "content": _build_content(resume_text, job_description)},
            ],
        },
        timeout=90,
    )

    if not resp.ok:
        raise RuntimeError(f"OpenRouter API {resp.status_code}: {resp.text[:500]}")

    raw = resp.json()["choices"][0]["message"]["content"]
    print(f"[ResumeIQ] OpenRouter responded — {len(raw)} chars")
    return _extract_json(raw)


def analyze_resume(resume_text: str, job_description: str = "") -> dict:
    """
    Main entry point. Set AI_PROVIDER in backend/.env:
        AI_PROVIDER=groq        (recommended — free, fast)
        AI_PROVIDER=gemini      (free)
        AI_PROVIDER=openrouter  (free models available)
    """
    provider = getattr(settings, "AI_PROVIDER", "groq").lower().strip()
    print(f"[ResumeIQ] provider='{provider}' | resume={len(resume_text)} chars | jd={len(job_description)} chars")

    if provider == "groq":
        result = _analyze_groq(resume_text, job_description)
    elif provider == "gemini":
        result = _analyze_gemini(resume_text, job_description)
    elif provider == "openrouter":
        result = _analyze_openrouter(resume_text, job_description)
    else:
        raise ValueError(
            f"Unknown AI_PROVIDER='{provider}'. "
            "Valid options: groq | gemini | openrouter"
        )

    return _validate_result(result)