# Backend Deployment Verification Guide

After deploying your backend to Railway, Render, or Hercel, use this guide to verify everything is working properly.

---

## ✅ Quick Verification Checklist

- [ ] Backend URL is accessible
- [ ] Database connection established
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Logs showing no errors

---

## 1. Verify Backend is Running

### Check Backend URL

Visit your backend URL in browser:
```
https://your-backend-url/api
```

**Expected Response:**
```json
{
  "message": "API Server Running",
  "status": "ok"
}
```

If you get a response, backend is **LIVE** ✅

---

## 2. Test Health Endpoint

### Endpoint
```
GET /api/health
```

### Using curl:
```bash
curl https://your-backend-url/api/health
```

### Expected Response:
```json
{
  "status": "ok",
  "timestamp": "2025-05-03T10:30:00Z",
  "uptime": "2h 15m"
}
```

**Status:** Backend is **HEALTHY** ✅

---

## 3. Test Database Connection

### Check if database is connected:

```bash
curl https://your-backend-url/api/health/db
```

**Expected Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "mongodb": "responsive"
}
```

**Status:** Database is **CONNECTED** ✅

---

## 4. Test Authentication API

### Test Login Endpoint

```bash
curl -X POST https://your-backend-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "emma@aurora.com",
    "password": "your-password"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Emma Johnson",
    "email": "emma@aurora.com",
    "role": "admin"
  }
}
```

**Status:** Authentication is **WORKING** ✅

---

## 5. Test Protected Endpoints

### Get Current User (requires token)

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend-url/api/users/me
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Emma Johnson",
    "email": "emma@aurora.com",
    "role": "admin",
    "team": "Product"
  }
}
```

**Status:** Protected routes are **SECURE** ✅

---

## 6. Test CORS Configuration

### Check CORS headers:

```bash
curl -H "Origin: https://your-frontend.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS https://your-backend-url/api/projects
```

**Expected Headers in Response:**
```
Access-Control-Allow-Origin: https://your-frontend.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

**Status:** CORS is **CONFIGURED** ✅

---

## 7. Test Project Endpoints

### Get All Projects:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend-url/api/projects
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Aurora Refresh Initiative",
      "description": "Website redesign",
      "status": "active",
      "members": [...]
    }
  ]
}
```

**Status:** Project API is **WORKING** ✅

---

## 8. Check Server Logs

### For Railway:

1. Go to Railway dashboard
2. Select your project
3. Click "Deployments" tab
4. View live logs

### For Render:

1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
4. View deployment logs

### Expected Logs:
```
✓ Connected to MongoDB
✓ Server running on port 3001
✓ CORS enabled for https://your-frontend.vercel.app
✓ JWT middleware active
```

**Status:** Logs show **NO ERRORS** ✅

---

## 9. Monitor Performance

### Check Response Times

```bash
time curl https://your-backend-url/api/projects
```

**Expected Response Time:** < 500ms

**Status:** Performance is **GOOD** ✅

### Monitor Memory Usage

Check your deployment platform dashboard:
- **Railway:** Metrics tab
- **Render:** Resource usage

**Expected:**
- Memory: < 300MB
- CPU: < 50%

**Status:** Resources are **HEALTHY** ✅

---

## 10. Test File Upload

### If your app has file uploads:

```bash
curl -X POST https://your-backend-url/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/test-file.pdf"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "filename": "test-file.pdf",
    "size": 2048576,
    "url": "/uploads/507f1f77bcf86cd799439012.pdf"
  }
}
```

**Status:** File uploads are **WORKING** ✅

---

## Common Issues & Solutions

### Issue 1: Backend URL Returns 404

**Problem:** API endpoints not found

**Solution:**
1. Check backend URL is correct
2. Verify routes are registered
3. Check `package.json` start command
4. Verify deployment logs for errors

### Issue 2: Database Connection Failed

**Problem:** "Cannot connect to MongoDB"

**Solution:**
1. Verify `MONGODB_URI` environment variable
2. Check MongoDB connection string format
3. Ensure IP whitelist includes deployment server
4. Test connection locally first

### Issue 3: CORS Error in Frontend

**Problem:** "Access to XMLHttpRequest blocked by CORS policy"

**Solution:**
1. Verify `CLIENT_URL` is set correctly in backend
2. Check CORS middleware is enabled
3. Verify frontend URL matches exactly
4. Clear browser cache

### Issue 4: JWT Token Invalid

**Problem:** "Invalid token" or "Token expired"

**Solution:**
1. Verify `JWT_SECRET` matches frontend
2. Check token format: `Bearer TOKEN`
3. Verify token not expired
4. Clear localStorage and re-login

### Issue 5: 500 Internal Server Error

**Problem:** Server error on API call

**Solution:**
1. Check deployment logs
2. Verify all environment variables set
3. Test endpoint with simple curl first
4. Check database connection

---

## Environment Variables to Verify

Ensure these are set in your deployment platform:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskpro
JWT_SECRET=your-secure-secret-key
CLIENT_URL=https://your-frontend.vercel.app
NODE_ENV=production
PORT=3001
SEED_ON_START=false
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/signup` - Create account
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Users
- `GET /api/users` - List all users (admin only)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Remove user

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

---

## Performance Benchmarks

| Metric | Target | Status |
|--------|--------|--------|
| API Response Time | < 500ms | ✅ |
| Database Query | < 100ms | ✅ |
| Memory Usage | < 300MB | ✅ |
| CPU Usage | < 50% | ✅ |
| Uptime | > 99.9% | ✅ |

---

## Production Checklist

- [ ] Environment variables all set
- [ ] Database connection verified
- [ ] SSL/HTTPS enabled
- [ ] Logs configured
- [ ] Error monitoring setup
- [ ] Backups configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] JWT secrets secure
- [ ] No hardcoded passwords

---

## Monitoring & Alerts

### Set up notifications for:
- High CPU usage (> 80%)
- High memory usage (> 500MB)
- Database connection failures
- API errors (5xx status)
- Deployment failures

---

## Need Help?

1. **Check Logs:** Your deployment platform logs first
2. **Verify Variables:** Ensure all environment variables are set
3. **Test Locally:** Run backend locally with same .env
4. **API Testing:** Use Postman or curl to test endpoints
5. **Database:** Verify MongoDB connection and data

---

## Success Indicators ✅

When all these are true, your backend is **PRODUCTION READY**:

✅ API responds to requests  
✅ Database connected and working  
✅ Authentication functioning  
✅ Protected routes secured  
✅ CORS properly configured  
✅ File uploads working  
✅ Logs show no errors  
✅ Performance within benchmarks  
✅ All endpoints tested and working  
✅ Environment variables secure  

---

## Next Steps

1. **Frontend Deployment:** Deploy frontend to Vercel
2. **Update Frontend .env:** Set `VITE_API_URL` to your backend URL
3. **End-to-End Testing:** Test full user flow from login to data operations
4. **Monitor:** Set up monitoring and alerts
5. **Backup:** Configure database backups
6. **Documentation:** Share access credentials securely with team

---

Your backend is now **DEPLOYED AND VERIFIED** ✅🚀
