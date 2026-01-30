# 🚀 Deployment Guide - Chikitsa (Render + Vercel)

## Prerequisites
- GitHub account
- Render account (render.com)
- Vercel account (vercel.com)
- Groq API key (console.groq.com)
- Code pushed to GitHub

---

## 📦 Part 1: Backend Deployment on Render

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `chikitsa-db`
   - **Database:** `chikitsa`
   - **User:** `chikitsa_user`
   - **Region:** Oregon (or closest to you)
   - **Plan:** Free
4. Click **"Create Database"**
5. **Save the Internal Database URL** (you'll need this)

### Step 3: Create Web Service on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository (`geetansshh/Chikitsa`)
3. Configure:
   - **Name:** `chikitsa-backend`
   - **Region:** Oregon (same as database)
   - **Branch:** `main`
   - **Root Directory:** `chikitsa_backend`
   - **Runtime:** Python 3
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn config.wsgi:application`

### Step 4: Add Environment Variables

In the Render dashboard, add these environment variables:

```env
DJANGO_SETTINGS_MODULE=config.settings.production
SECRET_KEY=<generate-a-strong-secret-key>
DEBUG=False
DATABASE_URL=<your-postgres-internal-url>
ALLOWED_HOSTS=.onrender.com
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
GROQ_API_KEY=<your-groq-api-key>
```

**To generate SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Once deployed, your backend will be at: `https://chikitsa-backend.onrender.com`

### Step 6: Create Superuser (Optional)

1. Go to your web service dashboard
2. Click **"Shell"** tab
3. Run:
```bash
python manage.py createsuperuser
```
Follow the prompts to create admin account.

### Step 7: Add Initial Data

In the Shell, create specialties:
```python
python manage.py shell

# In Python shell:
from apps.doctors.models import Specialty

specialties = [
    'Cardiology', 'Dermatology', 'Neurology', 
    'Pediatrics', 'Orthopedics', 'General Practice'
]

for spec in specialties:
    Specialty.objects.get_or_create(name=spec)

exit()
```

---

## 🌐 Part 2: Frontend Deployment on Vercel

### Step 1: Update Environment Variable

1. Edit `chikitsa_frontend/.env.production`
2. Replace with your actual Render backend URL:
```env
VITE_API_BASE_URL=https://chikitsa-backend.onrender.com/api
```

### Step 2: Commit and Push Changes
```bash
git add chikitsa_frontend/.env.production
git commit -m "Update production API URL"
git push origin main
```

### Step 3: Deploy to Vercel

**Option A: Using Vercel Dashboard (Recommended)**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository (`geetansshh/Chikitsa`)
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `chikitsa_frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variable:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://chikitsa-backend.onrender.com/api`
6. Click **"Deploy"**

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd chikitsa_frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Step 4: Update CORS Settings

1. Go back to Render dashboard
2. Find your backend web service
3. Update the `CORS_ALLOWED_ORIGINS` environment variable:
```env
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```
Replace `your-app.vercel.app` with your actual Vercel domain.

4. Save and wait for service to redeploy

---

## ✅ Part 3: Verify Deployment

### Test Backend
```bash
# Check health
curl https://chikitsa-backend.onrender.com/api/health

# Check doctors endpoint
curl https://chikitsa-backend.onrender.com/api/doctors/
```

### Test Frontend
1. Open your Vercel URL: `https://your-app.vercel.app`
2. Try to register a new account
3. Check if API calls work

---

## 🐛 Troubleshooting

### Issue: CORS Errors
**Solution:** Make sure `CORS_ALLOWED_ORIGINS` in Render includes your Vercel URL (with https://)

### Issue: Database Connection Failed
**Solution:** 
1. Check `DATABASE_URL` is set correctly
2. Make sure you're using the **Internal Database URL** from Render

### Issue: Static Files Not Loading
**Solution:** Run in Render Shell:
```bash
python manage.py collectstatic --no-input
```

### Issue: Render Service Keeps Crashing
**Solution:** Check logs in Render dashboard:
1. Go to your web service
2. Click **"Logs"** tab
3. Look for error messages

### Issue: Frontend Can't Connect to Backend
**Solution:**
1. Check browser console for CORS errors
2. Verify `VITE_API_BASE_URL` is correct
3. Make sure backend URL ends with `/api` (not `/api/`)

---

## 📝 Important Notes

### Free Tier Limitations

**Render:**
- Web services spin down after 15 minutes of inactivity
- First request after inactivity takes ~30 seconds (cold start)
- 750 hours/month free

**Vercel:**
- 100GB bandwidth/month
- Automatic deployments on git push

### Keeping Backend Awake

To avoid cold starts, you can:
1. Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your backend every 14 minutes
2. Upgrade to Render paid plan ($7/month for always-on)

### Custom Domain (Optional)

**Backend (Render):**
1. Go to web service settings
2. Add custom domain
3. Update DNS records

**Frontend (Vercel):**
1. Go to project settings → Domains
2. Add custom domain
3. Update DNS records

---

## 🔄 Continuous Deployment

Both Render and Vercel support automatic deployments:

- **Every push to `main` branch** triggers:
  - Render rebuilds backend
  - Vercel rebuilds frontend

To disable auto-deploy:
- **Render:** Service Settings → Auto-Deploy → Disable
- **Vercel:** Project Settings → Git → Disable

---

## 🎉 Success!

Your app is now live:
- **Backend:** `https://chikitsa-backend.onrender.com`
- **Frontend:** `https://your-app.vercel.app`

You can now share these URLs with users!

---

## Next Steps

1. Add monitoring (e.g., Sentry for error tracking)
2. Set up email service (SendGrid, Mailgun)
3. Add analytics (Google Analytics, Plausible)
4. Configure custom domain
5. Set up backup strategy for database

Need help? Check:
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
