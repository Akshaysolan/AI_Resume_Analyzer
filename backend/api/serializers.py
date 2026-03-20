from rest_framework import serializers
from .models import ResumeAnalysis


class ResumeUploadSerializer(serializers.Serializer):
    resume          = serializers.FileField()
    job_description = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_resume(self, value):
        allowed = ['.pdf', '.docx', '.txt']
        name = value.name.lower()
        if not any(name.endswith(ext) for ext in allowed):
            raise serializers.ValidationError(
                "Unsupported file type. Please upload PDF, DOCX, or TXT."
            )
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size must be under 10MB.")
        return value


class ResumeAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ResumeAnalysis
        fields = ['id', 'filename', 'job_description', 'analysis_result', 'created_at']
        read_only_fields = ['id', 'created_at']
