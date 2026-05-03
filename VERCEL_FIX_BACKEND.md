# Fix Vercel Backend Deployment Error

## Problem
Your backend is getting **500 INTERNAL_SERVER_ERROR** on Vercel because:
- Vercel uses **serverless functions** (not traditional servers)
- The old `server.js` setup can't listen on a port in serverless environment
- Environment variables weren't being read properly

## Solution ✅

I've fixed the configuration. Now follow these steps:

---

## Step 1: Push Updated Code

```bash
cd C:\Users\OS\Desktop\Z_project_assignemnt
git add .
git commit -m "Fix Vercel serverless backend configuration"
git push
```

---

## Step 2: Set Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Select Your Project**
   - Click on "task-management-system-backend"

3. **Go to Settings → Environment Variables**

4. **Add these variables:**

   | Variable Name | Value | Example |
   |---|---|---|
   | `MONGODB_URI` | Your MongoDB Atlas connection string | `mongodb+srv://username:password@cluster.mongodb.net/taskpro` |
   | `JWT_SECRET` | Secure random string | `your-super-secret-key-here` |
   | `CLIENT_URL` | Your frontend Vercel URL | `https://your-taskpro-frontend.vercel.app` |
   | `SEED_ON_START` | false | `false` |
   | `NODE_ENV` | production | `production` |

5. **Click "Save"**

---

## Step 3: Redeploy

1. **Go to Deployments tab**
2. **Click the 3-dot menu on latest deployment**
3. **Select "Redeploy"**
4. **Wait for build to complete**

---

## Step 4: Verify Backend is Working

Test the API:

```bash
curl https://your-backend-url/api
```

**Should respond with:**
```json
{
  "message": "API Server Running",
  "status": "ok"
}
```

If you see this, backend is **WORKING** ✅

---

## What Changed

### Old Setup (Broken)
```
src/server.js → app.listen(port) → ❌ Can't bind port on Vercel serverless
```

### New Setup (Fixed)
```
api/index.js → handler(req, res) → ✅ Works with Vercel serverless functions
```

---

## Files Modified

1. ✅ **api/index.js** - New serverless handler (created)
2. ✅ **backend/vercel.json** - Updated configuration
3. ✅ **backend/.vercelignore** - Ignore unnecessary files

---

## If Still Failing

### Check 1: Verify Environment Variables

```bash
# In Vercel dashboard, check these are set:
- MONGODB_URI ✓
- JWT_SECRET ✓
- CLIENT_URL ✓
- NODE_ENV=production ✓
```

### Check 2: View Deployment Logs

1. Go to Vercel Dashboard
2. Click Deployments
3. Click latest deployment
4. Click "View Build Logs"
5. Look for errors

### Check 3: Test MongoDB Connection

```bash
# Make sure your MongoDB URI is correct
mongodb+srv://username:password@cluster.mongodb.net/taskpro
```

Common issues:
- Wrong username/password
- IP not whitelisted in MongoDB Atlas
- Database doesn't exist

### Check 4: Clear Vercel Cache

1. Go to Settings → Git
2. Click "Disconnect Repository"
3. Reconnect repository
4. Trigger new deployment

---

## Expected Logs

When deployment succeeds, you should see:

```
✓ Database connected
✓ App initialized
✓ API ready to handle requests
```

---

## Common Error Messages & Fixes

### Error: "Cannot find module"
**Fix:** Make sure all dependencies are in `package.json`
```bash
cd backend
npm install
```

### Error: "MONGODB_URI is required"
**Fix:** Add MONGODB_URI to Vercel environment variables

### Error: "ECONNREFUSED"
**Fix:** Your MongoDB connection is failing
- Check MongoDB URI is correct
- Whitelist Vercel IP in MongoDB Atlas

### Error: "Timeout"
**Fix:** 
- Increase timeout in vercel.json (already set to 60 seconds)
- Optimize database queries
- Check internet connection

---

## Next Steps

After backend is working:

1. **Update Frontend .env**
   ```env
   VITE_API_URL=https://your-backend-url/api
   ```

2. **Deploy Frontend**
   - Push frontend code to GitHub
   - Connect to Vercel
   - Deploy

3. **Test Full App**
   - Visit frontend URL
   - Try login with `emma@aurora.com`
   - Create a project
   - Check API calls work

---

## Success Checklist ✅

- [ ] Environment variables set in Vercel
- [ ] Backend redeployed successfully
- [ ] API responds to requests
- [ ] Database is connected
- [ ] No errors in deployment logs
- [ ] Frontend can reach backend API
- [ ] Authentication working
- [ ] Data operations working

---

Your backend is now **FIXED FOR VERCEL** 🎉
