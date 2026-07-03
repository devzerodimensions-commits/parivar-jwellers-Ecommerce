# Deploying Parivar Jewellers (permanent public URL)

The app is **deployment-ready**: the backend serves the built frontend, the API,
and uploaded images all from **one origin**, and all image URLs are **relative**,
so it works on any domain.

There are two ways to make it public.

---

## Option A — Instant public link (temporary) ✅ already set up

Double-click **`share-online.bat`**. It builds the site, starts the server, and
prints a public `https://…trycloudflare.com` link you can share.

- Works while your PC + those windows stay open.
- The link **changes every time** you run it.
- Great for quick demos; not meant to be always-on.

---

## Option B — Permanent, always-online URL (recommended)

Always-on hosting needs a few **free accounts**. One clean setup:
**MongoDB Atlas** (database) + **Render** (runs the Node app, which also serves
the website). One service hosts everything.

### 1. Database — MongoDB Atlas (free)
1. Create an account at <https://www.mongodb.com/atlas> and a **free M0 cluster**.
2. Add a database user + allow network access from `0.0.0.0/0`.
3. Copy the connection string (looks like `mongodb+srv://user:pass@cluster.../jewelly`).

### 2. Code on GitHub
Push this project to a GitHub repo (needs a free GitHub account).

### 3. Host — Render (free)
1. Create an account at <https://render.com> → **New → Web Service** → connect the repo.
2. Settings:
   - **Root Directory:** _(leave blank / repo root)_
   - **Build Command:**
     ```
     npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend
     ```
   - **Start Command:**
     ```
     node backend/server.js
     ```
   - **Environment variables:**
     | Key | Value |
     |-----|-------|
     | `NODE_ENV` | `production` |
     | `MONGO_URI` | _(your Atlas string)_ |
     | `JWT_SECRET` | _(a long random string)_ |
     | `CLIENT_URL` | _(your Render URL, e.g. `https://parivar.onrender.com`)_ |
     | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | _(your admin login)_ |
3. Deploy. Your permanent URL is the Render URL.

### 4. Seed the live database (once)
In the Render **Shell** (or locally pointed at Atlas): `npm run seed --prefix backend`.

### Note on uploaded images
Render's disk is **ephemeral** — admin-uploaded images are lost on redeploy.
The generated catalogue images survive because seeding regenerates them. For
permanent user uploads, switch the upload controller to **Cloudinary** (free
tier) — a small change I can make when you're ready.

---

Want help with Option B? Create the Atlas + Render + GitHub accounts and I'll
walk you through every screen and finish the setup.
