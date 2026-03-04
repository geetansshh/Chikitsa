#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Apply database migrations
python manage.py makemigrations --no-input
python manage.py migrate --no-input

# Seed initial data (specialties, demo users, doctors)
python manage.py seed_data || true

echo "Build completed successfully!"
