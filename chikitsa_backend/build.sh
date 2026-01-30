#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Apply database migrations
python manage.py migrate --no-input

# Create superuser if it doesn't exist (optional)
# python manage.py createsuperuser --no-input --email admin@chikitsa.com || true

echo "Build completed successfully!"
