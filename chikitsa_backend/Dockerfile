# 1. Start with base Python image (empty Linux container)
FROM python:3.11-slim

# 2. Create folder INSIDE container called /backend
WORKDIR /chikitsa-backend

# 3. Copy requirements.txt FROM local TO container's /app
COPY requirements.txt .

# 4. Install dependencies INSIDE container
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy ALL your code FROM local TO container's /app
COPY . .
#Expose port
EXPOSE 8000
# Run django
CMD ["python","manage.py","runserver","0.0.0.0:8000"]