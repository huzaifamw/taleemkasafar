# ✅ VERCEL DEPLOYMENT CHECKLIST

## Pre-Deployment Setup

### 1. Local Environment ✓
- [x] Build successful (`npm run build`)
- [x] Database connected (Supabase)
- [x] PU Lahore test data imported (1,444 questions)
- [x] All migrations applied
- [x] `.env.local` configured locally

### 2. Git Repository ✓
- [x] All changes committed
- [x] Pushed to GitHub (huzaifamw/taleemkasafar)
- [x] `.gitignore` updated
- [x] No sensitive data in repo

### 3. Supabase Setup ✓
- [x] Project created: `lqopullrswpgqccklnie`
- [x] Database migrations complete
- [x] PU test data imported
- [x] RLS policies enabled
- [x] API keys ready

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Sign in to Vercel

1. Go to **https://vercel.com**
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### Step 2: Import Project

1. Click **"Add New Project"** button
2. Search for **"taleemkasafar"** repository
3. Click **"Import"** next to it

### Step 3: Configure Project

**Framework Preset:** Next.js (auto-detected)
**Root Directory:** `./` (leave default)
**Build Command:** `npm run build` (auto-detected)
**Output Directory:** `.next` (auto-detected)

Click **"Continue"** or **"Next"**

### Step 4: Add Environment Variables

Click **"Environment Variables"** section and add:

#### Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL
```
Value: `https://lqopullrswpgqccklnie.supabase.co`

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Value: `[Copy from your .env.local file]`

#### Optional Variables:

```
GEMINI_API_KEY
```
Value: `[Your Gemini API key if AI Insights is implemented]`

**Environment:** Select "Production", "Preview", and "Development"

### Step 5: Deploy

1. Click **"Deploy"** button
2. Wait 2-5 minutes for build to complete
3. Monitor build logs for any errors

### Step 6: Post-Deployment Configuration

1. Copy your Vercel deployment URL (e.g., `https://taleemkasafar.vercel.app`)
2. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
3. Add to **Redirect URLs**:
   - `https://taleemkasafar.vercel.app/auth/callback`
   - `https://taleemkasafar.vercel.app/**`

---

## 🧪 POST-DEPLOYMENT TESTING

Visit your deployed site and test:

- [ ] Homepage loads correctly
- [ ] User signup works
- [ ] User login works
- [ ] Dashboard displays both tests:
  - [ ] NET Engineering
  - [ ] PU Lahore
- [ ] Can start PU mock test
- [ ] Questions load correctly
- [ ] Can submit test and see results
- [ ] Admin panel accessible at `/admin`
- [ ] Admin login works

---

## 📊 YOUR DEPLOYMENT URLS

**Live Site:** `https://taleemkasafar.vercel.app` (will be shown after deployment)

**Admin Panel:** `https://taleemkasafar.vercel.app/admin`

**Vercel Dashboard:** https://vercel.com/dashboard

**Supabase Dashboard:** https://supabase.com/dashboard/project/lqopullrswpgqccklnie

---

## 🔧 TROUBLESHOOTING

### Build Fails on Vercel

**Problem:** Build errors in Vercel logs

**Solution:**
1. Run `npm run build` locally to see errors
2. Fix TypeScript/ESLint errors
3. Commit and push changes
4. Vercel will auto-redeploy

### "Failed to fetch" or Database Errors

**Problem:** Can't connect to Supabase

**Solution:**
1. Verify environment variables in Vercel dashboard
2. Check values match your `.env.local`
3. Ensure no extra spaces in variable values
4. Redeploy after fixing

### PU Test Not Showing

**Problem:** Only NET test visible on live site

**Solution:**
1. Check `entry_test_public` view in Supabase
2. Run query: `SELECT * FROM entry_test_public WHERE slug = 'pu'`
3. Verify `is_active = true` and `is_visible = true`
4. Clear Vercel cache: Settings → Data Cache → Clear

### Authentication Not Working

**Problem:** Login/signup fails on deployed site

**Solution:**
1. Add Vercel URL to Supabase Redirect URLs
2. Check Site URL in Supabase Auth settings
3. Verify JWT settings match
4. Clear browser cookies and retry

### 404 Errors on Routes

**Problem:** Some pages show 404

**Solution:**
1. Check route files exist in `app/` directory
2. Verify dynamic routes use correct folder naming `[slug]`
3. Check `vercel.json` if custom routes configured

---

## 🆘 GETTING HELP

**Vercel Documentation:** https://vercel.com/docs

**Next.js Deployment:** https://nextjs.org/docs/deployment

**Supabase Docs:** https://supabase.com/docs

**Check Logs:**
- Vercel: Dashboard → Project → Deployments → Click deployment → View logs
- Supabase: Dashboard → Logs Explorer

---

## ✅ DEPLOYMENT COMPLETE!

Once all tests pass:

1. **Share the URL** with users/examiners
2. **Monitor** the first 24 hours for errors
3. **Set up custom domain** (optional):
   - Vercel Dashboard → Project → Settings → Domains
4. **Enable analytics** (optional):
   - Vercel Dashboard → Project → Analytics

---

**Deployed by:** Huzaifa & Salah-ul-Din  
**Date:** January 2025  
**Project:** Taleemkasafar - Entry Test Preparation Platform
