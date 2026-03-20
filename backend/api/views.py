import traceback
import jwt
import datetime
from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import AppUser, ResumeAnalysis, BuiltResume
from .serializers import ResumeUploadSerializer, ResumeAnalysisSerializer
from .extractor import extract_resume_text
from .analyzer import analyze_resume


# ── JWT helpers ───────────────────────────────────────────────────────────────
def _make_token(user):
    payload = {
        "user_id": str(user.id),
        "email":   user.email,
        "exp":     datetime.datetime.utcnow() + datetime.timedelta(days=30),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def _get_user(request):
    """Return AppUser from Bearer JWT, or None."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[7:].strip()
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return AppUser.objects.get(id=payload["user_id"])
    except Exception:
        return None


def _require_auth(request):
    user = _get_user(request)
    if not user:
        return None, Response({"error": "Authentication required."}, status=401)
    return user, None


def _require_admin(request):
    user, err = _require_auth(request)
    if err:
        return None, err
    if not user.is_admin:
        return None, Response({"error": "Admin access required."}, status=403)
    return user, None


# ── Sign Up ───────────────────────────────────────────────────────────────────
@method_decorator(csrf_exempt, name='dispatch')
class SignUpView(APIView):
    def post(self, request):
        try:
            name     = (request.data.get("name")     or "").strip()
            email    = (request.data.get("email")    or "").strip().lower()
            password = (request.data.get("password") or "").strip()

            if not name:
                return Response({"error": "Name is required."}, status=400)
            if not email or "@" not in email:
                return Response({"error": "Valid email is required."}, status=400)
            if not password or len(password) < 6:
                return Response({"error": "Password must be at least 6 characters."}, status=400)

            if AppUser.objects.filter(email=email).exists():
                return Response({"error": "An account with this email already exists."}, status=409)

            user = AppUser(name=name, email=email)
            user.set_password(password)
            # Auto-grant admin if email matches admin email
            if email == "admin@gmail.com":
                user.is_admin = True
            user.save()

            token = _make_token(user)
            return Response({"token": token, "user": user.to_dict()}, status=201)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": f"Signup failed: {str(e)}"}, status=500)


# ── Sign In ───────────────────────────────────────────────────────────────────
@method_decorator(csrf_exempt, name='dispatch')
class SignInView(APIView):
    def post(self, request):
        try:
            email    = (request.data.get("email")    or "").strip().lower()
            password = (request.data.get("password") or "").strip()

            if not email or not password:
                return Response({"error": "Email and password are required."}, status=400)

            try:
                user = AppUser.objects.get(email=email)
            except AppUser.DoesNotExist:
                return Response({"error": "Invalid email or password."}, status=401)

            if not user.verify_password(password):
                return Response({"error": "Invalid email or password."}, status=401)

            token = _make_token(user)
            return Response({"token": token, "user": user.to_dict()})
        except Exception as e:
            traceback.print_exc()
            return Response({"error": f"Signin failed: {str(e)}"}, status=500)


# ── Me ────────────────────────────────────────────────────────────────────────
class MeView(APIView):
    def get(self, request):
        user, err = _require_auth(request)
        if err:
            return err
        return Response({"user": user.to_dict()})


# ── Resume Analysis ───────────────────────────────────────────────────────────
@method_decorator(csrf_exempt, name='dispatch')
class ResumeAnalyzeView(APIView):
    def post(self, request):
        user = _get_user(request)  # optional auth

        serializer = ResumeUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation failed", "details": serializer.errors}, status=400)

        resume_file     = serializer.validated_data["resume"]
        job_description = serializer.validated_data.get("job_description", "")

        try:
            resume_text = extract_resume_text(resume_file)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": f"Could not read file: {e}"}, status=422)

        try:
            analysis = analyze_resume(resume_text, job_description)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": f"AI analysis failed: {e}"}, status=500)

        try:
            record = ResumeAnalysis.objects.create(
                user=user,
                filename=resume_file.name,
                job_description=job_description,
                raw_text=resume_text[:5000],
                analysis_result=analysis,
            )
            return Response({"id": str(record.id), "filename": record.filename, "analysis": analysis})
        except Exception as e:
            traceback.print_exc()
            return Response({"id": None, "filename": resume_file.name, "analysis": analysis})


# ── History ───────────────────────────────────────────────────────────────────
class ResumeHistoryView(APIView):
    def get(self, request):
        user, err = _require_auth(request)
        if err:
            return err
        records = ResumeAnalysis.objects.filter(user=user).order_by('-created_at')[:20]
        data = [
            {
                "id":         str(r.id),
                "filename":   r.filename,
                "created_at": r.created_at.strftime("%Y-%m-%d %H:%M"),
                "score":      r.analysis_result.get("overall_score"),
                "grade":      r.analysis_result.get("grade"),
            }
            for r in records
        ]
        return Response(data)


# ── Save Built Resume ─────────────────────────────────────────────────────────
@method_decorator(csrf_exempt, name='dispatch')
class SaveResumeView(APIView):
    def post(self, request):
        user, err = _require_auth(request)
        if err:
            return err

        if not user.can_build:
            return Response({
                "error":   "free_limit_reached",
                "message": "You have used your 1 free resume build. Subscribe for unlimited access.",
            }, status=402)

        template_id = request.data.get("template_id", "modern")
        resume_data = request.data.get("resume_data", {})

        try:
            record = BuiltResume.objects.create(
                user=user, template_id=template_id, resume_data=resume_data
            )
            user.resumes_built += 1
            user.save(update_fields=['resumes_built'])
            return Response({"success": True, "id": str(record.id)})
        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)


# ── Track Download ────────────────────────────────────────────────────────────
@method_decorator(csrf_exempt, name='dispatch')
class TrackDownloadView(APIView):
    def post(self, request):
        user, err = _require_auth(request)
        if err:
            return err

        if not user.can_download:
            return Response({
                "error":   "free_limit_reached",
                "message": "You have used your 1 free download. Subscribe for unlimited access.",
            }, status=402)

        user.downloads_used += 1
        user.save(update_fields=['downloads_used'])
        return Response({"success": True, "downloads_used": user.downloads_used})


# ── Subscribe ─────────────────────────────────────────────────────────────────
@method_decorator(csrf_exempt, name='dispatch')
class SubscribeView(APIView):
    def post(self, request):
        user, err = _require_auth(request)
        if err:
            return err
        user.is_subscribed = True
        user.subscribed_at = timezone.now()
        user.save(update_fields=['is_subscribed', 'subscribed_at'])
        return Response({"success": True, "user": user.to_dict()})


# ── Health ────────────────────────────────────────────────────────────────────
class HealthCheckView(APIView):
    def get(self, request):
        return Response({
            "status":       "ok",
            "ai_provider":  getattr(settings, "AI_PROVIDER", "NOT SET"),
            "groq_key_set": bool(getattr(settings, "GROQ_API_KEY", "")),
        })


# ── Admin: List users ─────────────────────────────────────────────────────────
class AdminUsersView(APIView):
    def get(self, request):
        _, err = _require_admin(request)
        if err:
            return err
        users = AppUser.objects.all().order_by('-created_at')
        return Response({"users": [u.to_dict() for u in users], "total": users.count()})


# ── Admin: Grant Pro ──────────────────────────────────────────────────────────
@method_decorator(csrf_exempt, name='dispatch')
class AdminGrantView(APIView):
    def post(self, request):
        _, err = _require_admin(request)
        if err:
            return err
        email = (request.data.get("email") or "").strip().lower()
        try:
            target = AppUser.objects.get(email=email)
            target.is_subscribed = True
            target.subscribed_at = timezone.now()
            target.save(update_fields=['is_subscribed', 'subscribed_at'])
            return Response({"success": True, "message": f"Pro access granted to {email}"})
        except AppUser.DoesNotExist:
            return Response({"error": f"No user found with email: {email}"}, status=404)


# ── Admin: Revoke Pro ─────────────────────────────────────────────────────────
@method_decorator(csrf_exempt, name='dispatch')
class AdminRevokeView(APIView):
    def post(self, request):
        _, err = _require_admin(request)
        if err:
            return err
        email = (request.data.get("email") or "").strip().lower()
        try:
            target = AppUser.objects.get(email=email)
            target.is_subscribed = False
            target.save(update_fields=['is_subscribed'])
            return Response({"success": True, "message": f"Subscription revoked for {email}"})
        except AppUser.DoesNotExist:
            return Response({"error": f"No user found with email: {email}"}, status=404)
