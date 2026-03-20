"""
Django settings for AI Resume Analyzer
"""
import os
from pathlib import Path

# ── Load .env file FIRST, before anything else ───────────────────────────────
# Works on Windows and Linux. Uses python-dotenv.
try:
    from dotenv import load_dotenv
    # override=True forces .env values to win over existing env vars
    env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(dotenv_path=env_path, override=True)
    print(f"[Django] Loaded .env from: {env_path}")
except ImportError:
    pass  # python-dotenv not installed — rely on real env vars

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-dev-key-change-in-production-please'
)
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost 127.0.0.1').split()

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {'default': dj_database_url.parse(DATABASE_URL)}
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── CORS ──────────────────────────────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = DEBUG   # allows all origins in dev
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000 http://127.0.0.1:3000'
).split()

# ── REST Framework ────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
}

# ── AI Provider ───────────────────────────────────────────────────────────────
# Read from .env — default to 'groq' (most reliable free option)
AI_PROVIDER       = os.environ.get('AI_PROVIDER',       'groq').strip()
GROQ_API_KEY      = os.environ.get('GROQ_API_KEY',      '').strip()
GEMINI_API_KEY    = os.environ.get('GEMINI_API_KEY',    '').strip()
OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY', '').strip()
OPENROUTER_MODEL  = os.environ.get('OPENROUTER_MODEL',  'mistralai/mistral-7b-instruct:free').strip()

# Debug print — shows in Django console so you can verify keys are loaded
print(f"[Django] AI_PROVIDER  = '{AI_PROVIDER}'")
print(f"[Django] GROQ_API_KEY = '{'SET ✓' if GROQ_API_KEY else 'NOT SET ✗'}'")
print(f"[Django] GEMINI_KEY   = '{'SET ✓' if GEMINI_API_KEY else 'NOT SET ✗'}'")

# ── File upload limits ────────────────────────────────────────────────────────
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024   # 10 MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024

# ── Sessions (needed for UserProfile tracking) ────────────────────────────────
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_AGE = 60 * 60 * 24 * 30   # 30 days
SESSION_SAVE_EVERY_REQUEST = True

# ── CSRF ──────────────────────────────────────────────────────────────────────
# Disable CSRF for API endpoints (we use JWT instead)
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]
# REST Framework — disable CSRF for API views
REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] = []
REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = []
