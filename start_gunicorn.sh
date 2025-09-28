#!/bin/bash
# Cronomy Gunicorn Startup Script

# Load environment variables if .env exists
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
fi

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
elif [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start Gunicorn
exec gunicorn -c gunicorn.conf.py wsgi:app