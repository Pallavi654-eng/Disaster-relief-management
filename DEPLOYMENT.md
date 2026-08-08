# Render Deployment Guide

## 1. Push the project to GitHub
Make sure the repository is connected to GitHub and the default branch is `main`.

## 2. Create Docker Hub images
Create a Docker Hub account and create these repositories:
- `your-username/disaster-relief-server`
- `your-username/disaster-relief-client`

## 3. Add GitHub secrets
In GitHub repository settings, add:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `RENDER_BACKEND_DEPLOY_HOOK_URL`
- `RENDER_FRONTEND_DEPLOY_HOOK_URL`

## 4. Create the Render services
In Render:
- Create a Web Service for the backend.
  - Use the Docker image: `your-username/disaster-relief-server:latest`
  - Set environment variables:
    - `NODE_ENV=production`
    - `PORT=10000`
    - `MONGODB_URI=your_mongodb_connection_string`
    - `GEMINI_API_KEY=optional`
- Create a Web Service for the frontend.
  - Use the Docker image: `your-username/disaster-relief-client:latest`
  - Set port `80`
  - Set environment variables if needed:
    - `VITE_API_URL=https://your-backend-render-url`
    - `VITE_SOCKET_URL=https://your-backend-render-url`

## 5. Deploy
Push to `main` and GitHub Actions will:
1. Build the Docker images
2. Push them to Docker Hub
3. Trigger Render redeploys
