# Online Judge System

A full-stack online judge platform for coding competitions and practice, built with React, Node.js, Express, and MongoDB.


- 🚀 **Multi-language Support**: C++, Java, Python
- 🧠 **AI-Powered Error Analysis**: Smart debugging assistance with fallback support
- 📊 **Statistics Dashboard**: Track progress, difficulty levels, and activity
- 🔐 **Authentication**: Google OAuth and JWT-based auth
- 💻 **Code Editor**: Monaco Editor with syntax highlighting
- ⚡ **Real-time Execution**: Fast code compilation and execution
- 🐳 **Docker Support**: Easy deployment with Docker containers

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd OJ/WEBDEV/OJ

# Copy environment template
cp .env.example .env
```

### 2. Configure Environment (Optional)

Edit `.env` file to add your API keys:

```bash
# For Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# For AI error analysis (optional)
GOOGLE_GEMINI_API=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

**Note**: The system works without these API keys using fallback mechanisms.

### 3. Run with Docker

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

### 4. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### 5. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

## Development Setup (Without Docker)

### Backend Setup

```bash
cd backend
npm install
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### MongoDB

Install MongoDB locally or use MongoDB Atlas.

## Docker Architecture

### Services

1. **Frontend** (Port 80)
   - React + Vite application
   - Nginx reverse proxy
   - Routes API calls to backend

2. **Backend** (Port 5000)
   - Node.js + Express API
   - Code execution environment
   - AI error analysis with fallbacks

3. **MongoDB** (Port 27017)
   - Database with auto-initialization
   - Persistent data storage

### Docker Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Rebuild specific service
docker-compose up --build backend

# Execute commands in containers
docker-compose exec backend sh
docker-compose exec mongodb mongosh

# Check service status
docker-compose ps
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GOOGLE_GEMINI_API` | No | Google Gemini API key |
| `OPENAI_API_KEY` | No | OpenAI API key |

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `docker-compose.yml` if needed
2. **Permission errors**: Ensure Docker has proper permissions
3. **Build failures**: Clear Docker cache with `docker system prune`
4. **Database connection**: Check MongoDB container logs

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose up --build
```

## Production Deployment

1. Set strong passwords in `docker-compose.yml`
2. Use environment-specific `.env` files
3. Configure proper reverse proxy (nginx/Apache)
4. Set up SSL certificates
5. Use Docker secrets for sensitive data
6. Configure log rotation and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## License

MIT License - see LICENSE file for details.