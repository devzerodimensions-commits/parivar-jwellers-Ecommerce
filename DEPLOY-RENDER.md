# Deploy Parivar Jewellers to a branded, free URL

Goal: a real, reliable web address like **https://parivarjewellers.onrender.com** —
custom name, no "click-to-continue" warning page, works even when your PC is off.

You'll use three **free** services:

| Service | Purpose | Cost |
|---------|---------|------|
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud database | Free (M0) |
| [GitHub](https://github.com) | Stores the code Render deploys | Free |
| [Render](https://render.com) | Runs the store | Free |

> Free-tier notes: the site "sleeps" after ~15 min of no visitors and takes ~40s to wake
> on the next visit (normal for demos). Images you upload *after* deploying reset on each
> redeploy; the seeded demo images are kept because they ship with the code.

Total time: ~20–30 minutes. Do the steps in order.

---

## Step 1 — Create the cloud database (MongoDB Atlas)

1. Sign up at https://www.mongodb.com/atlas → create a **free M0** cluster (any region).
2. **Database Access** → *Add New Database User* → username + password (save them).
3. **Network Access** → *Add IP Address* → **Allow access from anywhere** (`0.0.0.0/0`).
4. **Database** → *Connect* → *Drivers* → copy the connection string. It looks like:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Insert your password and add the database name `jewelly` before the `?`:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/jewelly?retryWrites=true&w=majority
   ```
   Keep this — it's your **MONGO_URI**.

## Step 2 — Seed the database once (from your PC)

This fills Atlas with the demo categories, products, and admin account.

```powershell
cd C:\Users\Admin\Desktop\jewelly-code\backend
$env:MONGO_URI="<paste your Atlas MONGO_URI here>"
$env:ADMIN_EMAIL="admin@parivarjewellers.com"
$env:ADMIN_PASSWORD="<choose a strong admin password>"
npm run seed
```
Wait for it to print that seeding finished.

## Step 3 — Put the code on GitHub

```powershell
cd C:\Users\Admin\Desktop\jewelly-code
git init
git add -A
git add -f backend/uploads          # include the demo product images
git commit -m "Parivar Jewellers store"
```
Then create an **empty** repo at https://github.com/new (no README), and run the two
lines GitHub shows you, e.g.:
```powershell
git remote add origin https://github.com/<you>/parivar-jewellers.git
git branch -M main
git push -u origin main
```

## Step 4 — Deploy on Render

**Easiest (Blueprint):**
1. https://dashboard.render.com → **New +** → **Blueprint**.
2. Connect your GitHub and pick the repo. Render reads `render.yaml` automatically.
3. When prompted, fill the secret values:
   - **MONGO_URI** → your Atlas string from Step 1
   - **ADMIN_PASSWORD** → the same one you used in Step 2
   - **CLIENT_URL** → leave blank for now (set it in Step 5)
4. Click **Apply**. Render builds and deploys (first build ~3–5 min).

**Manual alternative:** New + → *Web Service* → connect repo →
Build Command `npm run build`, Start Command `npm start`, Plan **Free**, and add the
same environment variables from `render.yaml` under *Environment*.

## Step 5 — Finish & verify

1. Render gives you the URL, e.g. `https://parivarjewellers.onrender.com`
   (if the name is taken, pick another like `parivar-jewellers`).
2. In Render → your service → **Environment**, set **CLIENT_URL** to that exact URL and save
   (this triggers a quick redeploy).
3. Open the URL. First load may take ~40s (waking up). You should see the store.
4. Admin panel: `https://<your-url>/admin/login` → sign in with
   `admin@parivarjewellers.com` and the admin password you chose.

Done — that address is your permanent, branded, shareable link. 🎉

---

### Want an even cleaner address later?
Buy `parivarjewellers.com` (~$10/yr) and add it under Render → *Settings → Custom Domains*.
Render gives you the DNS records to paste at your domain registrar, and the site then
lives at **https://parivarjewellers.com**.
