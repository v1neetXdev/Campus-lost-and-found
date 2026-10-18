# 🎒 Campus Lost & Found Management System
Django REST + MySQL backend, React (Vite) frontend.

## 1. Database (MySQL)
```sql
CREATE DATABASE lostfound CHARACTER SET utf8mb4;
```

## 2. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env       # then put your MySQL password in .env
python manage.py makemigrations items
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
Admin panel (manage database): http://127.0.0.1:8000/admin/

## 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## API
`POST /api/auth/register/` · `POST /api/auth/login/` · `/api/items/` (filters: `type, category, status, q, mine`) · `POST /api/items/{id}/resolve/` · `/api/claims/` · `POST /api/claims/{id}/decide/`

## Future ideas
Email/WhatsApp notifications, matching lost↔found automatically, admin moderation, QR tags, deployment (Render + Vercel).
