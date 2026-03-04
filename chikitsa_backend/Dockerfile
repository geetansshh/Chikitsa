FROM python:3.11-slim

WORKDIR /chikitsa-backend

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Make entrypoint executable
RUN chmod +x entrypoint.sh

EXPOSE ${PORT:-8000}

# Production: entrypoint handles migrations + gunicorn on $PORT
# For local docker-compose, CMD is overridden by docker-compose.yml command
CMD ["./entrypoint.sh"]