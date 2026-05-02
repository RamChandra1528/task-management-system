# Deployment Guide

This app is designed for:

- Backend and MongoDB: Railway
- Frontend: Vercel

Official references:

- Railway build/start commands: https://docs.railway.com/reference/build-and-start-commands
- Railway MongoDB: https://docs.railway.com/guides/mongodb
- Railway start command: https://docs.railway.com/guides/start-command
- Vercel Vite deployments: https://vercel.com/docs/frameworks/vite
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Vercel CLI deploy: https://vercel.com/docs/cli/deploy

## 1. Prepare Environment Variables

Backend production variables:

```env
PORT=5000
MONGODB_URI=<railway-mongodb-private-or-public-url>
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://<your-vercel-domain>
SEED_ON_START=false
MAX_UPLOAD_BYTES=10485760
```

Frontend production variable:

```env
VITE_API_URL=https://<your-railway-backend-domain>/api
```

Use a strong `JWT_SECRET` in production. Do not reuse the example value.

## 2. Deploy MongoDB On Railway

1. Open Railway and create a new project.
2. Add a MongoDB database service.
3. Copy the Mongo connection string.
4. Prefer Railway private networking when the backend service is in the same Railway project.

## 3. Deploy Backend On Railway

Recommended Railway service settings:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

The backend also includes:

```text
backend/Procfile
```

Set the backend environment variables in Railway.

After deployment, verify:

```text
https://<your-railway-backend-domain>/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "TaskPro API is healthy"
}
```

## 4. Seed Production Data

For a real production app, keep:

```env
SEED_ON_START=false
```

For a demo deployment, temporarily set:

```env
SEED_ON_START=true
```

Start the backend once, confirm data exists, then set it back to `false`.

Demo admin account:

```text
Email: emma@aurora.com
Password: TaskPro123!
```

Change this password before using the app with real users.

## 5. Deploy Frontend On Vercel

Recommended Vercel project settings:

```text
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Set:

```env
VITE_API_URL=https://<your-railway-backend-domain>/api
```

The frontend includes:

```text
frontend/vercel.json
```

This rewrites client-side routes to `index.html`, so routes like `/app/projects` work on refresh.

## 6. Connect CORS

After Vercel gives you the production URL, update Railway:

```env
CLIENT_URL=https://<your-vercel-domain>
```

If you use preview deployments too, you can allow multiple origins:

```env
CLIENT_URL=https://<production-domain>,https://<preview-domain>
```

## 7. Production Smoke Test

1. Open the Vercel URL.
2. Sign up or log in.
3. Create a project.
4. Create a task and assign it.
5. Move the task on the kanban board.
6. Add a calendar event.
7. Upload a file.
8. Create a conversation and send a message.
9. Update profile/settings.
10. Check dashboard/report numbers update from real API data.

## 8. Common Deployment Issues

### CORS Error

Check `CLIENT_URL` on Railway. It must match the exact Vercel origin.

### Frontend Cannot Reach Backend

Check `VITE_API_URL` on Vercel. It must end with `/api`.

### Mongo Connection Failure

Check `MONGODB_URI` and whether the backend can access the selected Railway MongoDB URL.

### Refreshing `/app/...` Shows 404

Confirm `frontend/vercel.json` exists and Vercel deployed from the `frontend` directory.

## Live Deployment Note

I cannot make the app live from this workspace without access to your Railway and Vercel accounts or deployment tokens. The code and configuration are prepared for deployment; the final publish step must be done from your accounts.
