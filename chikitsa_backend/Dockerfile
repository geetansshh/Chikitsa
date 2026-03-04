FROM python:3.11-slim

WORKDIR /chikitsa-backend

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Default: dev server (overridden by render.yaml startCommand in production)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]