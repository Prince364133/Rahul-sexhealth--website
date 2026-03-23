# Horse Fire — Setup Guide

## 🔐 Your Admin Dashboard Link
```
https://YOUR-VERCEL-DOMAIN.vercel.app/admin/index.html?token=HF_ADMIN_2026_9Kx7mPqRvNw3$Zd8#QbYe
```
> ⚠️ Keep this token secret. Anyone with this URL has full admin access.
> To change it: update `ADMIN_SECRET_TOKEN` in Render env vars and redeploy.

---

## Step 1 — Deploy Backend to Render
1. Push the `/backend` folder to a GitHub repo.
2. Go to [render.com](https://render.com) → **New Web Service** → connect your repo.
3. **Root directory:** `backend`
4. **Build command:** `npm install`
5. **Start command:** `node server.js`
6. Add the following **Environment Variables** (copy from `backend/.env`):
   - `MONGO_URI`
   - `ADMIN_SECRET_TOKEN`
   - `PORT` (Render will override this automatically)
7. Copy your Render URL, e.g., `https://horsefire-api.onrender.com`

## Step 2 — Update Backend URL
After deploying, go to **Admin Dashboard → Settings tab** and update the **Backend API URL** field with your Render URL. Or manually update `FALLBACK_BACKEND` in `index.html` and `offer.html`.

## Step 3 — Deploy Frontend to Vercel
1. Push the entire project root folder to GitHub.
2. Connect to [vercel.com](https://vercel.com), import the repo, and deploy.
3. No build step is needed — it's a static project.

## Step 4 — Seed Database
```bash
cd backend
npm install
node seed.js
```
This creates the app settings document and 10 test leads.

## Step 5 — Test Your Setup
- Visit your Vercel URL → should show the landing page.
- Submit a test lead → should save to MongoDB.
- Visit your admin URL → should show the dashboard with statistics.
- Go to **Settings tab** → verify and update the WhatsApp number.

---

## 📁 Project Structure
```
/                    → Frontend (deploy to Vercel)
├── index.html       → Landing Page (main ad destination)
├── offer.html       → Sales/Offer Page
├── thank.html       → Thank You Page (post-submission)
├── admin/
│   └── index.html   → Admin Dashboard (3 tabs)
├── style/
│   └── main.css     → Design System
├── img/             → Image Assets
├── api/             ← ⛔ DO NOT TOUCH (Cloaking PHP scripts)
└── vercel.json      ← ⛔ DO NOT TOUCH

/backend             → Node.js API (deploy to Render)
├── server.js
├── seed.js
├── .env             → Real credentials (never commit!)
├── .env.example     → Template
├── models/
│   ├── Lead.js
│   └── Settings.js
├── routes/
│   ├── leads.js     → POST /api/leads + GET /api/settings/public
│   └── admin.js     → All protected admin endpoints
└── middleware/
    └── auth.js
```

## 📞 WhatsApp Number
Currently set to: **+91 95401 36589**  
To update: **Admin Dashboard → Settings tab → enter new number → Save**.

## 🔄 Cloaking System
The `api/` folder and `vercel.json` handle traffic filtering via your cloakit.house integration. **Never modify these files.**
