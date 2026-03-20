from django.urls import path
from .views import (
    SignUpView, SignInView, MeView,
    ResumeAnalyzeView, ResumeHistoryView,
    SaveResumeView, TrackDownloadView, SubscribeView,
    AdminUsersView, AdminGrantView, AdminRevokeView,
    HealthCheckView,
)

urlpatterns = [
    # Auth
    path('auth/signup/',    SignUpView.as_view(),    name='signup'),
    path('auth/signin/',    SignInView.as_view(),    name='signin'),
    path('auth/me/',        MeView.as_view(),        name='me'),
    # Resume analysis
    path('analyze/',        ResumeAnalyzeView.as_view(),   name='analyze'),
    path('history/',        ResumeHistoryView.as_view(),   name='history'),
    # Builder
    path('save-resume/',    SaveResumeView.as_view(),      name='save-resume'),
    path('track-download/', TrackDownloadView.as_view(),   name='track-download'),
    path('subscribe/',      SubscribeView.as_view(),       name='subscribe'),
    # Admin
    path('admin/users/',    AdminUsersView.as_view(),      name='admin-users'),
    path('admin/grant/',    AdminGrantView.as_view(),      name='admin-grant'),
    path('admin/revoke/',   AdminRevokeView.as_view(),     name='admin-revoke'),
    # Health
    path('health/',         HealthCheckView.as_view(),     name='health'),
]
