# Deployment Guide

This project is designed to be deployed as two separate services:
1. **Frontend**: Next.js application (Recommended: Vercel)
2. **Backend**: Go API service (Recommended: Render, Railway, or Fly.io)

## 1. Backend Deployment (Render.com)

Render offers a free tier for web services that is perfect for this backend.

1. **Push your code** to GitHub.
2. Sign up for [Render](https://render.com/).
3. Click **"New +"** -> **"Web Service"**.
4. Connect your GitHub repository.
5. Select the `tracer-backend` directory as the **Root Directory** (Important!).
6. Render should automatically detect the `Dockerfile`.
   - **Runtime**: Docker
   - **Build Command**: (Leave default)
   - **Start Command**: (Leave default)
7. **Environment Variables**:
   Add the following environment variables in the Render dashboard:
   - `RPC_URL`: Your Ethereum RPC URL (e.g., from Alchemy, Infura, or QuickNode).
   - `PORT`: `8080` (Default)
8. Click **"Create Web Service"**.
9. Once deployed, copy your **Service URL** (e.g., `https://tracer-backend.onrender.com`).

## 2. Frontend Deployment (Vercel)

Vercel is the native platform for Next.js.

1. Sign up for [Vercel](https://vercel.com/).
2. Click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository.
4. **Configure Project**:
   - **Root Directory**: Click "Edit" and select `tracer-frontend`.
   - **Framework Preset**: Next.js (should be auto-detected).
5. **Environment Variables**:
   Add the following variable:
   - `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (from Step 1).
     - Example: `https://tracer-backend.onrender.com` (Note: Do NOT add a trailing slash `/`)
6. Click **"Deploy"**.

## Verification

1. Open your Vercel deployment URL.
2. Ensure the "Configuration" panel loads.
3. Try running a simulation or tracing a transaction.
4. If it fails, check the browser console (F12) to ensure it's trying to connect to your Render URL, not localhost.
