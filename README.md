# Cronomy
A desktop GUI for your crontab.

## Installation & Setup

### Development Setup
```bash
# Install dependencies
npm run install

# Start development server (with Tailwind watch)
npm run dev
```

### Production Deployment with Gunicorn

#### Method 1: Using npm scripts
```bash
# Install dependencies
npm run install

# Start with Gunicorn
npm run start:prod
```

#### Method 2: Direct Gunicorn command
```bash
# Activate virtual environment
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start with Gunicorn
gunicorn -c gunicorn.conf.py wsgi:app
```

#### Method 3: Using startup script
```bash
./start_gunicorn.sh
```

## Configuration

### Gunicorn Configuration
The app uses `gunicorn.conf.py` for Gunicorn configuration. Key settings:
- **Bind**: `0.0.0.0:8000` (listens on all interfaces, port 8000)
- **Workers**: 4 (adjust based on CPU cores)
- **Timeout**: 30 seconds
- **Logging**: Enabled to stdout/stderr

### Environment Variables
Create a `.env` file for environment-specific settings:
```
onboarded=true
# Add other environment variables as needed
```

## API Endpoints
- `GET /` - Main entries page
- `GET /scheduled` - Scheduled tasks view
- `GET /onboarding` - Onboarding page
- `GET /api/entries` - Get all crontab entries
- `POST /api/entries/new` - Create new crontab entry
- `POST /api/entries/edit` - Edit existing crontab entry
- `GET /api/dependencies` - Check if crontab is installed
- `GET /api/crontab_path` - Get crontab path information
