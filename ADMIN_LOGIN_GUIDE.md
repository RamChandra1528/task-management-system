# Admin Login Guide

## Quick Admin Login

### Default Admin Credentials

**Email:** `emma@aurora.com`
**Password:** `[Your SEED_ADMIN_PASSWORD]`

---

## How Admin Account is Created

### Step 1: Set Environment Variable

Before running seed, set the admin password in `.env`:

```env
SEED_ADMIN_PASSWORD=your-secure-password-here
```

### Step 2: Run Seed Script

```bash
npm run seed
```

This creates the default admin account with credentials above.

### Step 3: Login to App

1. Go to login page: `http://localhost:5173/login` (local) or your Vercel URL
2. Enter email: `emma@aurora.com`
3. Enter password: `your-secure-password-here`
4. Click **Login**

---

## What is an Admin?

Admin users have full access to:
- ✅ All Projects and Tasks
- ✅ Team Management
- ✅ User Permissions
- ✅ Admin Dashboard
- ✅ Reports and Analytics
- ✅ System Settings
- ✅ All Team Workspaces

---

## Admin Features

### Admin Dashboard
- Path: `/app/admin`
- Only visible to admin users
- Manage users, permissions, and system settings

### Permissions
Admin users have these permissions by default:
- Project Management
- Task Management
- Team Management
- Reports Access
- Billing Management

---

## Create Additional Admin Users

### Option 1: Via Database (MongoDB)

1. Connect to MongoDB
2. Find user document
3. Change `role` field to `"admin"`

```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

### Option 2: Create New Admin During Seed

Edit `backend/src/seed/bootstrap.js`:

```javascript
{
  name: "Your Name",
  email: "admin@example.com",
  role: "admin",  // ← Set to admin
  team: "Product",
  jobTitle: "Administrator",
  // ... other fields
}
```

Then run seed again.

---

## Troubleshooting Admin Login

### Issue: Admin button not showing

**Solution:** Check if user role is `"admin"` in database

```javascript
db.users.findOne({ email: "emma@aurora.com" })
// Check: role field = "admin"
```

### Issue: Admin page not accessible

**Solution:** 
1. Clear browser cache
2. Logout and login again
3. Check network tab for API errors

### Issue: Password not working

**Solution:**
1. Check `SEED_ADMIN_PASSWORD` is set correctly in `.env`
2. Ensure seed was run after setting the password
3. Check password matches exactly (case-sensitive)

---

## Admin Capabilities

### 1. User Management
- View all users in workspace
- Change user roles
- Remove users
- Reset passwords

### 2. Project Administration
- View/edit all projects
- Archive projects
- Manage project members
- View project analytics

### 3. Task Oversight
- View all tasks
- Override task assignments
- Close overdue tasks
- View task reports

### 4. Team Management
- Create/edit teams
- Manage team members
- Set team permissions
- View team activity

### 5. System Settings
- Configure workspace settings
- Manage integrations
- View system logs
- Generate reports

---

## Security Best Practices

### For Development:
- Use simple password: `admin123` or `taskpro-admin`

### For Production:
- Use strong password: Mix of uppercase, lowercase, numbers, special chars
- Example: `T@skPro#2025!Secure`
- Never share admin credentials
- Use environment variables for secrets
- Store SEED_ADMIN_PASSWORD in Vercel secrets

---

## Changing Admin Password

### In App:
1. Login as admin
2. Go to `/app/settings`
3. Click "Change Password"
4. Enter old password and new password
5. Save

### In Database:
```javascript
// Use bcrypt to hash new password
const bcrypt = require('bcryptjs');
const newPassword = await bcrypt.hash('new-password', 10);

db.users.updateOne(
  { email: "emma@aurora.com" },
  { $set: { password: newPassword } }
)
```

---

## Admin Routes

| Route | Purpose |
|-------|---------|
| `/app/admin` | Admin Dashboard |
| `/app/admin/users` | User Management |
| `/app/admin/projects` | Project Admin |
| `/app/admin/settings` | System Settings |

---

## API Admin Authentication

For API calls as admin:

1. **Login API:**
   ```bash
   POST /api/auth/login
   {
     "email": "emma@aurora.com",
     "password": "your-password"
   }
   ```

2. **Use JWT Token:**
   ```bash
   Authorization: Bearer <token>
   ```

3. **Admin-only endpoints:**
   - `GET /api/users` (all users)
   - `GET /api/projects` (all projects)
   - `PUT /api/users/:id` (edit user)
   - `DELETE /api/users/:id` (remove user)

---

## Reset Admin Access

### If you lose admin credentials:

1. **Stop backend server**
2. **Delete database:**
   ```bash
   # MongoDB
   mongo taskpro
   db.users.deleteMany({})
   ```

3. **Run seed again:**
   ```bash
   npm run seed
   ```

4. **Use default credentials:**
   - Email: `emma@aurora.com`
   - Password: `$SEED_ADMIN_PASSWORD`

---

## Production Deployment

### On Vercel:

1. Set environment variable in Vercel dashboard:
   ```
   SEED_ADMIN_PASSWORD = strong-secure-password
   ```

2. Run seed on backend once during initial setup

3. Change password immediately after first login

---

## Questions or Issues?

Check the main [README.md](README.md) for troubleshooting section or refer to [API Documentation](docs/API.md).
