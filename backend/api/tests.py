"""
Tests for the AI Resume Analyzer API.
"""
import json
import io
from unittest.mock import patch, MagicMock

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient


MOCK_ANALYSIS = {
    "overall_score": 72,
    "grade": "B",
    "summary": "A solid mid-level software engineer resume.",
    "candidate_name": "Jane Doe",
    "contact_info": {"email": "jane@example.com", "phone": None, "linkedin": None, "location": "NYC"},
    "sections": {
        "contact":      {"score": 80, "status": "good",      "feedback": "Contact info is clear."},
        "summary":      {"score": 70, "status": "good",      "feedback": "Summary could be more specific."},
        "experience":   {"score": 75, "status": "good",      "feedback": "Good use of action verbs."},
        "education":    {"score": 85, "status": "excellent", "feedback": "Strong education section."},
        "skills":       {"score": 65, "status": "needs_work","feedback": "Add more technical skills."},
        "achievements": {"score": 55, "status": "needs_work","feedback": "Quantify achievements."},
    },
    "strengths": ["Clear structure", "Good experience depth", "Relevant education", "Clean formatting", "Consistent dates"],
    "improvements": [
        {"priority": "high",   "title": "Quantify achievements", "description": "Add numbers.", "example": "Led team of 5"},
        {"priority": "medium", "title": "Add skills section",    "description": "List tools.",  "example": "Python, Django, React"},
        {"priority": "low",    "title": "Summary length",        "description": "Expand it.",   "example": "Add 1 more sentence"},
    ],
    "skills_found": ["Python", "Django"],
    "skills_missing": ["Docker", "Kubernetes"],
    "keywords": {"present": ["software", "engineer"], "suggested": ["agile", "ci/cd"]},
    "ats_score": 68,
    "ats_issues": ["No LinkedIn URL detected"],
    "experience_years": 4,
    "career_level": "mid",
    "industry": "Software Engineering",
    "job_titles": ["Software Engineer"],
    "job_match": {"score": None, "matched_keywords": [], "missing_keywords": [], "recommendation": None},
    "action_plan": [
        {"step": 1, "action": "Add metrics to bullets", "timeframe": "Today"},
        {"step": 2, "action": "Expand skills section",  "timeframe": "This week"},
        {"step": 3, "action": "Add LinkedIn URL",       "timeframe": "Today"},
        {"step": 4, "action": "Write stronger summary", "timeframe": "This week"},
        {"step": 5, "action": "Get peer review",        "timeframe": "This month"},
    ],
}


class HealthCheckTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check_returns_ok(self):
        url = reverse('health-check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'ok')


class ResumeAnalyzeTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('resume-analyze')

    def _make_txt_file(self, content="John Doe\njohn@example.com\n\nExperience: 5 years Python dev"):
        return io.BytesIO(content.encode('utf-8'))

    def test_no_file_returns_400(self):
        response = self.client.post(self.url, {}, format='multipart')
        self.assertEqual(response.status_code, 400)

    def test_wrong_file_type_returns_400(self):
        bad_file = io.BytesIO(b"<html>not a resume</html>")
        bad_file.name = 'resume.html'
        response = self.client.post(self.url, {'resume': bad_file}, format='multipart')
        self.assertEqual(response.status_code, 400)

    @patch('api.views.analyze_resume')
    @patch('api.views.extract_resume_text')
    def test_valid_txt_upload_returns_analysis(self, mock_extract, mock_analyze):
        mock_extract.return_value = "John Doe\nSoftware Engineer\nPython, Django"
        mock_analyze.return_value = MOCK_ANALYSIS

        txt = self._make_txt_file()
        txt.name = 'resume.txt'
        response = self.client.post(self.url, {'resume': txt}, format='multipart')

        self.assertEqual(response.status_code, 200)
        self.assertIn('analysis', response.data)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['analysis']['overall_score'], 72)

    @patch('api.views.analyze_resume')
    @patch('api.views.extract_resume_text')
    def test_with_job_description(self, mock_extract, mock_analyze):
        mock_extract.return_value = "Jane Doe\nPython developer"
        mock_analyze.return_value = MOCK_ANALYSIS

        txt = self._make_txt_file()
        txt.name = 'resume.txt'
        response = self.client.post(self.url, {
            'resume': txt,
            'job_description': 'Looking for a senior Python engineer with Django experience.',
        }, format='multipart')

        self.assertEqual(response.status_code, 200)
        # Verify job description was passed to analyzer
        args, kwargs = mock_analyze.call_args
        self.assertIn('Django', args[1])

    @patch('api.views.extract_resume_text')
    def test_extraction_failure_returns_422(self, mock_extract):
        mock_extract.side_effect = ValueError("Could not parse PDF.")

        txt = self._make_txt_file()
        txt.name = 'resume.txt'
        response = self.client.post(self.url, {'resume': txt}, format='multipart')

        self.assertEqual(response.status_code, 422)
        self.assertIn('error', response.data)

    @patch('api.views.analyze_resume')
    @patch('api.views.extract_resume_text')
    def test_ai_failure_returns_500(self, mock_extract, mock_analyze):
        mock_extract.return_value = "Some resume text"
        mock_analyze.side_effect = Exception("API rate limit exceeded")

        txt = self._make_txt_file()
        txt.name = 'resume.txt'

        with self.settings(ANTHROPIC_API_KEY='test-key'):
            response = self.client.post(self.url, {'resume': txt}, format='multipart')

        self.assertEqual(response.status_code, 500)


class ResumeHistoryTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('api.views.analyze_resume')
    @patch('api.views.extract_resume_text')
    def test_history_returns_list(self, mock_extract, mock_analyze):
        # Create a couple of records first
        mock_extract.return_value = "Resume text here"
        mock_analyze.return_value = MOCK_ANALYSIS

        url = reverse('resume-analyze')
        for i in range(2):
            txt = io.BytesIO(b"Resume content")
            txt.name = f'resume_{i}.txt'
            with self.settings(ANTHROPIC_API_KEY='test-key'):
                self.client.post(url, {'resume': txt}, format='multipart')

        history_url = reverse('resume-history')
        response = self.client.get(history_url)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 2)
