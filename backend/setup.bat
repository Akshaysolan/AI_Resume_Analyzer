@echo off
echo ==========================================
echo  ResumeIQ Backend Setup
echo ==========================================

echo [1/4] Creating virtual environment...
python -m venv venv
call venv\Scripts\activate

echo [2/4] Installing packages...
pip install -r requirements.txt

echo [3/4] Running database migrations...
python manage.py makemigrations api
python manage.py migrate

echo [4/4] Creating admin user (admin@gmail.com / Admin@123)...
python manage.py seed_admin

echo.
echo ==========================================
echo  Setup complete! Starting server...
echo  Admin: admin@gmail.com / Admin@123
echo ==========================================
python manage.py runserver
