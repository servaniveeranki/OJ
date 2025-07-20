# Deployment Guide

## Frontend Deployment on Vercel

### Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Push your code to a GitHub repository

### Steps to Deploy Frontend

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory
   - Vercel will auto-detect it's a Vite project
   - Add environment variable:
     - `VITE_API_URL`: Your Render backend URL (e.g., `https://your-app.onrender.com`)
   - Click "Deploy"

3. **Domain Configuration**
   - After deployment, note your Vercel domain (e.g., `https://your-app.vercel.app`)
   - You'll need this for backend CORS configuration

## Backend Deployment on Render

### Prerequisites
- GitHub account
- Render account (sign up at render.com)

### Steps to Deploy Backend

1. **Deploy on Render**
   - Go to [render.com](https://render.com) and sign in
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: `online-judge-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

2. **Environment Variables**
   Add these environment variables in Render:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLIENT_URL=https://your-vercel-app.vercel.app
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Database Setup**
   - Use MongoDB Atlas for cloud database
   - Get connection string and add to `MONGODB_URI`

## Final Configuration

### Update Frontend Environment
After backend deployment, update the frontend environment variable:
- In Vercel dashboard, go to your project settings
- Update `VITE_API_URL` to your Render backend URL
- Redeploy if necessary

### Test the Deployment
1. Visit your Vercel frontend URL
2. Test user registration/login
3. Test code submission and execution
4. Verify all features work correctly

## Important Notes

- **Security**: Never commit `.env` files to GitHub
- **CORS**: Ensure frontend URL is added to backend `CLIENT_URL`
- **Database**: Use MongoDB Atlas for production database
- **Monitoring**: Both Vercel and Render provide logs and monitoring
- **Custom Domains**: Both platforms support custom domain configuration

## Troubleshooting

### Common Issues
1. **CORS Errors**: Check `CLIENT_URL` in backend environment
2. **API Connection**: Verify `VITE_API_URL` in frontend
3. **Build Failures**: Check build logs in respective platforms
4. **Database Connection**: Verify MongoDB URI and network access

### Logs Access
- **Vercel**: Dashboard → Project → Functions tab
- **Render**: Dashboard → Service → Logs tab
