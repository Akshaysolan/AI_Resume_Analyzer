from django.db import models
from django.contrib.auth.hashers import make_password, check_password as django_check_password
import uuid


class AppUser(models.Model):
    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name          = models.CharField(max_length=150)
    email         = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=256)
    is_admin      = models.BooleanField(default=False)
    is_subscribed = models.BooleanField(default=False)
    downloads_used= models.IntegerField(default=0)
    resumes_built = models.IntegerField(default=0)
    subscribed_at = models.DateTimeField(null=True, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)

    FREE_DOWNLOAD_LIMIT = 1
    FREE_BUILD_LIMIT    = 1

    class Meta:
        db_table = 'app_user'

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def verify_password(self, raw_password):
        return django_check_password(raw_password, self.password_hash)

    @property
    def can_download(self):
        return bool(self.is_admin or self.is_subscribed or self.downloads_used < self.FREE_DOWNLOAD_LIMIT)

    @property
    def can_build(self):
        return bool(self.is_admin or self.is_subscribed or self.resumes_built < self.FREE_BUILD_LIMIT)

    def to_dict(self):
        return {
            "id":            str(self.id),
            "name":          self.name,
            "email":         self.email,
            "is_admin":      self.is_admin,
            "is_subscribed": self.is_subscribed,
            "downloads_used":self.downloads_used,
            "resumes_built": self.resumes_built,
            "can_download":  self.can_download,
            "can_build":     self.can_build,
            "created_at":    self.created_at.strftime("%Y-%m-%d %H:%M"),
        }

    def __str__(self):
        return f"{self.email} (admin={self.is_admin})"


class ResumeAnalysis(models.Model):
    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user            = models.ForeignKey(
        AppUser, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='analyses'
    )
    filename        = models.CharField(max_length=255)
    job_description = models.TextField(blank=True, default='')
    raw_text        = models.TextField(default='')
    analysis_result = models.JSONField(default=dict)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'resume_analysis'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.filename} [{self.created_at:%Y-%m-%d}]"


class BuiltResume(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user        = models.ForeignKey(
        AppUser, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='built_resumes'
    )
    template_id = models.CharField(max_length=50, default='modern')
    resume_data = models.JSONField(default=dict)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'built_resume'
        ordering = ['-created_at']

    def __str__(self):
        return f"Resume {str(self.id)[:8]} | {self.template_id}"
