# 🧠 ResumeIQ — AI Resume Analyzer

A full-stack AI-powered resume analyzer built with **React** (frontend) and **Django** (backend), using **Claude AI (Anthropic)** for deep, structured resume analysis.

---

## ✨ Features

- 📄 Upload PDF, DOCX, or TXT resumes
- 🤖 AI analysis powered by Claude (Anthropic)
- 📊 Overall score, grade (A–F), section-by-section breakdown
- 🎯 ATS compatibility score & issues
- 💼 Job description matching with keyword gap analysis
- 🛠️ Prioritized improvement recommendations
- 📋 5-step personalized action plan
- 🌙 4 built-in dark themes (Dark, Midnight, Slate, Forest)
- 📱 Fully responsive design

---

## 🗂️ Project Structure

```
ai-resume-analyzer/
├── backend/            # Django REST API
│   ├── api/            # App: models, views, serializers, analyzer
│   ├── config/         # Django settings, urls, wsgi
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/           # React app
│   ├── public/
│   ├── src/
│   │   ├── components/ # All UI components
│   │   ├── context/    # ThemeContext
│   │   ├── services/   # API calls
│   │   ├── App.js
│   │   └── index.css   # Global design system
│   └── package.json
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── nginx.conf
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — add your ANTHROPIC_API_KEY

# Run migrations
python manage.py migrate

# Start dev server
python manage.py runserver
# → http://localhost:8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm start
# → http://localhost:3000
```

The React dev server proxies `/api` to `http://localhost:8000` automatically.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DJANGO_SECRET_KEY` | ✅ | Django secret key |
| `ANTHROPIC_API_KEY` | ✅ | Your Anthropic API key |
| `DEBUG` | — | `True` for dev, `False` for prod |
| `ALLOWED_HOSTS` | — | Space-separated allowed hosts |
| `CORS_ALLOWED_ORIGINS` | — | Space-separated frontend URLs |
| `DATABASE_URL` | — | PostgreSQL URL (uses SQLite if blank) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API URL (default: `/api` via proxy) |

---

## 🐳 Docker Deployment

```bash
# Copy and configure env
cp backend/.env.example backend/.env
# Edit backend/.env

# Build and run
docker-compose up --build

# → Frontend: http://localhost
# → Backend API: http://localhost/api
```

---

## ☁️ Production Deployment

### Option A: Render.com (Recommended — Free tier available)

**Backend (Web Service):**
1. Connect your GitHub repo
2. Build command: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
3. Start command: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
4. Add env vars: `ANTHROPIC_API_KEY`, `DJANGO_SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS=your-backend.onrender.com`

**Frontend (Static Site):**
1. Build command: `npm install && npm run build`
2. Publish dir: `build`
3. Add env var: `REACT_APP_API_URL=https://your-backend.onrender.com/api`

### Option B: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login

# Deploy backend
cd backend
railway init
railway up

# Deploy frontend
cd ../frontend
railway init
railway up
```

### Option C: Heroku

```bash
# Backend
heroku create resumeiq-api
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
heroku config:set DJANGO_SECRET_KEY=...
heroku config:set DEBUG=False
heroku config:set ALLOWED_HOSTS=resumeiq-api.herokuapp.com
git push heroku main

# Frontend (Netlify or Vercel recommended)
```

### Option D: VPS (Ubuntu/Debian)

```bash
# Install dependencies
sudo apt update && sudo apt install python3-pip nodejs npm nginx

# Clone repo, install, configure env files
# Configure nginx (see nginx.conf)
# Use systemd for gunicorn
# Use certbot for SSL
```

---

## 🔒 Security Checklist (Production)

- [ ] `DEBUG=False`
- [ ] Strong `DJANGO_SECRET_KEY` (50+ random chars)
- [ ] Set `ALLOWED_HOSTS` to your domain only
- [ ] Set `CORS_ALLOWED_ORIGINS` to frontend URL only
- [ ] Use PostgreSQL (not SQLite)
- [ ] Enable HTTPS
- [ ] Rotate `ANTHROPIC_API_KEY` periodically

---

## 📡 API Reference

### `POST /api/analyze/`
Analyze a resume file.

**Request:** `multipart/form-data`
- `resume` — File (PDF/DOCX/TXT, max 10MB)
- `job_description` — string (optional)

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "filename": "resume.pdf",
  "analysis": {
    "overall_score": 78,
    "grade": "B+",
    "summary": "...",
    "sections": {...},
    "strengths": [...],
    "improvements": [...],
    "ats_score": 82,
    "action_plan": [...]
  }
}
```

### `GET /api/health/`
Returns `{"status": "ok"}`.

### `GET /api/history/`
Returns last 20 analyses.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Recharts, React Dropzone |
| Styling | Custom CSS design system (CSS variables) |
| Backend | Django 4.2, Django REST Framework |
| AI | Anthropic Claude (claude-opus-4-5) |
| File parsing | PyPDF2, python-docx |
| Production server | Gunicorn + Nginx |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Containerization | Docker + Docker Compose |

---

## 📄 License

MIT
