# 🚀 Taleemkasafar - Complete Deployment Guide

## 📋 Overview

This guide walks you through deploying **Taleemkasafar**, a Next.js-based entry test preparation platform, to production using Vercel (hosting) and Supabase (database).

**Live Architecture:**
- **Frontend + Backend:** Next.js 14 (App Router + Server Actions)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel (Edge Functions + CDN)
- **Authentication:** Supabase Auth (JWT-based)

---

## 🎯 What You'll Deploy

### Features
✅ User authentication (signup/login)  
✅ Two entry tests: NET Engineering & PU Lahore  
✅ Mock test generation (100 random questions)  
✅ Subject-wise practice mode  
✅ Performance analytics & insights  
✅ Admin panel (test & question management)  
✅ Responsive UI (mobile + desktop)

### Database Contents
- **2 Entry Tests:** NET Engineering, PU Lahore
- **1,444 Questions:** PU test questions
- **5,888 Options:** Multiple choice options
- **48 Topics:** Across 5 subjects (English, Urdu, Math, IQ, General Knowledge)
- **Mock Blueprint:** 100-question structure

---

## 🛠️ Prerequisites

Before deploying, ensure you have:

1. ✅ **GitHub Account** - Your code repository
2. ✅ **Vercel Account** - For hosting (free tier available)
3. ✅ **Supabase Project** - Database is already set up (`lqopullrswpgqccklnie`)
4. ✅ **Git Installed** - To push code
5. ✅ **Node.js 18+** - To test locally

---

## 📦 Local Development Setup (Optional)

If someone else wants to run this locally:

### 1. Clone Repository

```bash
git clone https://github.com/huzaifamw/taleemkasafar.git
cd taleemkasafar/Taleemkasafar
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lqopullrswpgqccklnie.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
GEMINI_API_KEY=[optional-for-ai-insights]
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## 🚀 Production Deployment to Vercel

### Step-by-Step Process

#### 1️⃣ Prepare Your Code

Run the preparation script:

```powershell
cd Taleemkasafar
.\scripts\prepare-for-vercel.ps1
```

This will:
- ✅ Create backup of environment files
- ✅ Test build locally
- ✅ Check for sensitive files
- ✅ Verify Git status

#### 2️⃣ Commit & Push to GitHub

```bash
git add .
git commit -m "chore: prepare for Vercel deployment"
git push origin main
```

#### 3️⃣ Deploy to Vercel

**Option A: Using Vercel Dashboard (Recommended)**

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel
5. Click **"Add New Project"**
6. Search for **"taleemkasafar"**
7. Click **"Import"**
8. Configure:
   - Framework: Next.js ✓ (auto-detected)
   - Root Directory: `./Taleemkasafar`
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)
9. Add Environment Variables (see below)
10. Click **"Deploy"**

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

#### 4️⃣ Add Environment Variables in Vercel

In Vercel dashboard → Project Settings → Environment Variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lqopullrswpgqccklnie.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `[Copy from .env.local]` | Production, Preview, Development |
| `GEMINI_API_KEY` | `[Optional - AI features]` | Production |

**Where to find these values:**
- Your local `.env.local` file
- Supabase Dashboard → Settings → API

#### 5️⃣ Configure Supabase Redirect URLs

After first deployment:

1. Copy your Vercel URL: `https://taleemkasafar.vercel.app`
2. Go to Supabase Dashboard: https://supabase.com/dashboard/project/lqopullrswpgqccklnie
3. Navigate to: **Authentication** → **URL Configuration**
4. Add these URLs:

```
https://taleemkasafar.vercel.app
https://taleemkasafar.vercel.app/auth/callback
https://taleemkasafar.vercel.app/**
```

5. Set Site URL: `https://taleemkasafar.vercel.app`
6. Click **"Save"**

#### 6️⃣ Verify Deployment

Visit your deployed site and test:

- ✅ Homepage loads
- ✅ Signup/login works
- ✅ Both tests visible (NET + PU)
- ✅ Can start mock test
- ✅ Questions display correctly
- ✅ Submit test shows results
- ✅ Admin panel accessible

---

## 🔐 Security Checklist

- ✅ `.env.local` NOT committed to Git
- ✅ Environment variables stored securely in Vercel
- ✅ Supabase RLS policies enabled
- ✅ Admin routes protected with authentication
- ✅ HTTPS enforced (automatic on Vercel)
- ✅ No API keys in client-side code

---

## 📊 Monitoring & Analytics

### Vercel Analytics

Enable in Vercel Dashboard:
1. Project → Analytics
2. Toggle "Enable Analytics"
3. View metrics: page views, performance, errors

### Supabase Monitoring

Available in Supabase Dashboard:
- Database performance
- API requests count
- Active connections
- Query performance

### Error Tracking

**View Logs:**
- **Vercel:** Dashboard → Deployments → [deployment] → View Function Logs
- **Supabase:** Dashboard → Logs Explorer

---

## 🔧 Common Issues & Solutions

### Issue: Build Fails on Vercel

**Symptoms:** Red X on deployment, build logs show errors

**Solutions:**
1. Run `npm run build` locally first
2. Fix TypeScript errors: `npm run type-check`
3. Fix ESLint errors: `npm run lint`
4. Check for missing dependencies
5. Verify all imports are correct

### Issue: "Failed to fetch" or Database Errors

**Symptoms:** Site loads but can't fetch data

**Solutions:**
1. Check environment variables in Vercel match `.env.local`
2. Verify Supabase project is active
3. Test API URL: visit `https://lqopullrswpgqccklnie.supabase.co`
4. Check for typos in variable names
5. Redeploy after fixing

### Issue: PU Test Not Showing

**Symptoms:** Only NET test visible, PU missing from dropdown

**Solutions:**
1. Check database: `SELECT * FROM entry_test_public WHERE slug = 'pu'`
2. Verify `is_active = true` and `is_visible = true`
3. Clear cache: Vercel Settings → Data Cache → Clear
4. Check frontend queries in `lib/queries/catalog.ts`

### Issue: Authentication Loops or Fails

**Symptoms:** Login redirects infinitely or shows error

**Solutions:**
1. Add Vercel URL to Supabase Redirect URLs (see Step 5)
2. Check Site URL matches deployment URL
3. Clear browser cookies
4. Verify JWT settings in Supabase
5. Check callback route exists: `app/auth/callback/route.ts`

### Issue: 404 on Dynamic Routes

**Symptoms:** Mock test pages show 404

**Solutions:**
1. Verify folder structure: `app/(dashboard)/mock/[attemptId]/page.tsx`
2. Check dynamic imports
3. Ensure data is fetched correctly in Server Components
4. Check for client/server component mismatches

### Issue: Images Not Loading

**Symptoms:** Broken image icons

**Solutions:**
1. Check image paths are correct
2. Add domains to `next.config.mjs`:
```js
images: {
  domains: ['lqopullrswpgqccklnie.supabase.co']
}
```
3. Use Next.js Image component
4. Verify Supabase Storage permissions

---

## 🎨 Custom Domain (Optional)

### Add Custom Domain

1. Buy domain (e.g., from Namecheap, GoDaddy)
2. Vercel Dashboard → Project → Settings → Domains
3. Click "Add Domain"
4. Enter: `taleemkasafar.com`
5. Follow DNS configuration instructions
6. Wait for DNS propagation (5-30 minutes)
7. Update Supabase Redirect URLs with new domain

---

## 📈 Performance Optimization

### Already Implemented
- ✅ Next.js App Router (faster routing)
- ✅ Server Components (reduced client JS)
- ✅ Database indexes on frequently queried columns
- ✅ Static generation where possible

### Optional Improvements
- Add Vercel Edge Cache headers
- Implement ISR (Incremental Static Regeneration)
- Add image optimization
- Enable compression in `next.config.mjs`

---

## 👥 Team Collaboration

### Adding Team Members

**Vercel:**
1. Dashboard → Project → Settings → Team
2. Click "Invite Member"
3. Enter email address

**Supabase:**
1. Dashboard → Settings → Team
2. Click "Invite"
3. Set role (Admin/Developer/Read-only)

### Access Levels

**Admin:**
- Can deploy, modify settings, invite members
- Full database access

**Developer:**
- Can view deployments, logs
- Database read/write

**Viewer:**
- Can view deployments
- Database read-only

---

## 🔄 Continuous Deployment

Vercel automatically redeploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main

# Vercel automatically builds and deploys
```

**Deployment Triggers:**
- Push to `main` branch → Production
- Push to `develop` branch → Preview
- Pull Request → Preview deployment

---

## 📞 Support & Resources

### Documentation
- **Next.js:** https://nextjs.org/docs
- **Vercel:** https://vercel.com/docs
- **Supabase:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

### Getting Help
1. Check deployment logs in Vercel
2. Check database logs in Supabase
3. Review this guide's troubleshooting section
4. Contact project maintainers

### Project Structure
```
Taleemkasafar/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # User-facing pages
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities & queries
├── supabase/             # Database migrations
├── scripts/              # Deployment scripts
└── docs/                 # Documentation
```

---

## ✅ Deployment Complete!

**Your live URLs:**
- 🌐 **Live Site:** https://taleemkasafar.vercel.app
- 🔐 **Admin Panel:** https://taleemkasafar.vercel.app/admin
- 📊 **Vercel Dashboard:** https://vercel.com/dashboard
- 💾 **Supabase Dashboard:** https://supabase.com/dashboard/project/lqopullrswpgqccklnie

**Next Steps:**
1. ✅ Test all features on live site
2. ✅ Monitor errors for first 24 hours
3. ✅ Share URL with users
4. ✅ Set up custom domain (optional)
5. ✅ Enable analytics (optional)

---

**Deployed by:** Huzaifa & Salah-ul-Din  
**Repository:** https://github.com/huzaifamw/taleemkasafar  
**Last Updated:** January 2025
