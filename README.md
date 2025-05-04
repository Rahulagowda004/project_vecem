# Project Vecem

A full-stack application for managing datasets and user profiles.

## Project Structure

```
├── Backend/             # FastAPI backend
│   ├── src/            # Source code
│   ├── requirements.txt # Python dependencies
│   └── .env.template   # Environment variables template
├── Frontend/           # React frontend
│   ├── src/           # Source code
│   └── .env.template  # Environment variables template
└── library/           # Shared library code
```

## Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
- MongoDB
- Azure Storage Account

## Environment Setup

### Backend Setup

1. Create a `.env` file in the Backend directory using `.env.template` as reference
2. Install dependencies:

```bash
cd Backend
pip install -r requirements.txt
```

### Frontend Setup

1. Create a `.env` file in the Frontend directory using `.env.template` as reference
2. Install dependencies:

```bash
cd Frontend
npm install
```

## Development

### Running Backend

```bash
cd Backend
uvicorn src.main:app --reload --port 5000
```

### Running Frontend

```bash
cd Frontend
npm run dev
```

## Production Deployment

### Backend Deployment

1. Set up environment variables in your production environment
2. Install production dependencies:

```bash
pip install -r requirements.txt
```

3. Run with a production ASGI server:

```bash
gunicorn src.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend Deployment

1. Set up environment variables in your production environment
2. Build the frontend:

```bash
npm run build
```

3. Deploy the contents of the `dist` directory to your static hosting service

## Security Notes

- All sensitive credentials must be stored in environment variables
- API keys and secrets should never be committed to the repository
- CORS is configured for specific origins only
- Rate limiting is enabled for API endpoints
- Error handling and logging are configured for production

## Monitoring and Logging

- Backend logs are stored in the `logs` directory with timestamp-based filenames
- Production errors are properly sanitized before being sent to clients
- All API endpoints have proper logging with request tracking

## Environment Variables

### Backend Variables

- `MONGODB_URL`: MongoDB connection string
- `DATABASE_NAME`: MongoDB database name
- `AZURE_STORAGE_CONNECTION_STRING`: Azure Storage connection string
- `AZURE_CONTAINER_NAME`: Azure Storage container name
- `PORT`: API server port (default: 5000)
- `ENV`: Environment name (development/production)

### Frontend Variables

- `VITE_API_BASE_URL`: Backend API URL
- `VITE_API_URL`: API endpoint prefix
- `VITE_ENCRYPTION_KEY`: Encryption key for sensitive data
- `REACT_APP_FIREBASE_*`: Firebase configuration variables

## License

This project is licensed under the MIT License - see the LICENSE file for details
