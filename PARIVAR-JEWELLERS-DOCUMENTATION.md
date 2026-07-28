# Parivar Jewellers — Project Documentation

_Last updated: 28 July 2026_

A complete guide to the Parivar Jewellers online store — where it lives, how it's built,
every feature, and how to manage it. Written so anyone (owner, staff, or a future developer)
can understand and run the site.

---

## 1. Live Website

| What | Link / Value |
|------|--------------|
| **Website** | https://parivarjewellers.co.in |
| **Showroom Gold-Rate board** | https://parivarjewellers.co.in/gold-rate |
| **Admin panel** | https://parivarjewellers.co.in/admin/login |
| **Admin email** | `admin@parivarjewellers.com` |
| **Admin password** | `Admin@123` _(change it after first login)_ |

The site is **always online** (even when your PC is off) and uses **HTTPS** (secure padlock).

---

## 2. How It's Hosted (architecture)

The store is a **MERN app** (MongoDB + Express + React + Node) deployed to free cloud services:

| Layer | Service | Notes |
|-------|---------|-------|
| **Website + API** | [Render](https://dashboard.render.com) (free web service `parivarjewellers`) | Serves the site + backend on one URL. Auto-deploys on every push. |
| **Database** | [MongoDB Atlas](https://cloud.mongodb.com) (free M0, Mumbai) | Cluster `cluster0.wzxbvtn`, DB `jewelly`. Network access open (0.0.0.0/0). |
| **Code** | [GitHub](https://github.com/devzerodimensions-commits/parivar-jwellers-Ecommerce) | Branch `main`. |
| **Domain** | Hostinger (`parivarjewellers.co.in`) | DNS: `A @ → 216.24.57.1`, `CNAME www → parivarjewellers.onrender.com`. SSL auto by Render. |

**Free-tier note:** the site "sleeps" after ~15 min of no visitors and takes ~40–50 seconds
to wake on the next visit. This is normal for the free plan.

**Auto-deploy:** any change pushed to GitHub `main` automatically rebuilds and goes live on
Render in ~3–5 minutes. No manual steps.

---

## 3. Store Details (current settings)

| Field | Value |
|-------|-------|
| **Store name** | Parivar Jewellers |
| **Tagline / title** | Parivar Jewellers - Gold, Silver, Diamond Jewellery Store in Mehsana |
| **Phone** | +91 82829 69651 |
| **Address** | G-58, Silicon Skyland, Opp Kashi Vishvanath Mahadev Mandir, Radhanpur Road, Gujarat 384002 |
| **Logo** | Parivar "PJ" monogram (transparent PNG) |
| **Favicon** | PJ monogram (browser tab icon) |
| **Mode** | **Enquiry mode ON** (prices hidden, enquiry form instead of cart) |

All of these are editable in **Admin → Settings**.

---

## 4. Features (what the site does)

### Storefront (customer side)
- **Home page** — hero banner, categories & products as sliders (grid on mobile).
- **Category mega-menu** in the top nav — 6 groups: Jewellery, Metals, Wedding, For, Others,
  Purity (each with sub-items). Clicking an item searches matching products.
- **Live Gold Rate strip** at the very top — 24K / 22K / 18K per gram, auto-updating.
- **Shop / category / search pages** with filters (Metal, For, Collection, Price).
- **Product page** — image gallery, auto-built **Specifications** (Metal, Purity, Gross/Net
  Weight, For, Occasion + any custom attributes), description, related products.
- **Enquiry mode** — prices are hidden; every product shows an **"Enquire"** button that opens
  a **form popup** (Name, Email, Phone, Subject, Enquiry). Submissions are saved and appear in
  **Admin → Enquiries**.
- **Policy page** (`/policy`), wishlist, account/registration, password reset.
- **Showroom Gold-Rate board** (`/gold-rate`) — full-screen live rate display for a TV/screen.

### Admin panel
- **Dashboard** — in enquiry mode it shows Total Enquiries, New Enquiries, Products, Customers,
  Recent Enquiries + Low Stock (order/revenue widgets are hidden in enquiry mode).
- **Gold Rate** — dedicated page: live 24K/22K/18K rates + manual override.
- **Products, Categories, Brands** — full catalogue management.
- **Enquiries** — every customer enquiry (name, email, phone, subject, message, product).
- **Content** — Banners, Blog, Reviews. **Media** library. **Users** (roles/permissions).
- **Settings** — name, tagline, logo, favicon, contact, address, social, enquiry mode, theme.

_In enquiry mode, "Orders" and "Coupons" are hidden automatically (no cart/checkout)._

---

## 5. Live Gold Rate — how it works

A key feature. Shows today's gold rate and updates automatically.

- **Source:** live international gold price (USD/oz) + live USD→INR, converted to **INR per gram**
  for 24K / 22K / 18K, plus an **India retail uplift (~15.2%)** for import duty + GST + premium —
  tuned to match published Indian (Gujarat) rates.
- **Auto-update:** backend refreshes every **15 minutes**; the on-page strip refreshes every
  **10 minutes**. It always shows a fresh rate (even after the site wakes from sleep).
- **Where it shows:** the top strip on every page, the `/gold-rate` showroom board, and the
  admin Gold Rate page.

### Setting your own rate (manual)
Go to **Admin → Gold Rate → "Set Your Own Rate"**, enter your **24K rate (₹ per gram)** and Save.
The whole site then shows that rate (22K/18K are auto-calculated). To go back to the automatic
live rate, click **"Use automatic"** (or clear the field). This is what jewellers usually do —
set the exact daily rate each morning.

### Showroom board
Open **https://parivarjewellers.co.in/gold-rate** on a screen/TV in the showroom. It's a
full-screen, elegant board with big 24K/22K/18K rates (per gram + per 10 g), the date, a live
indicator, and your store name/address/phone. It refreshes itself.

---

## 6. Managing Enquiries

Because the store runs in **enquiry mode**, customers don't place orders — they send enquiries.

1. Customer clicks **Enquire** on a product → fills the popup form → submits.
2. It's saved to the database and appears in **Admin → Enquiries** (and emailed to the store
   if SMTP is configured).
3. In Admin → Enquiries you can see all details and set status: **New → Contacted → Closed**,
   or delete.

---

## 7. Adding a Product (jewellery)

**Admin → Products → Add New.** Recommended fields for a jewellery piece:

- **Photos** (multiple angles) — most important in enquiry mode.
- **Name**, **Category**, **Short description**, **Description**.
- **Material** (Gold), **Purity** (e.g. 22K BIS 916), **Gross Weight**, **Net Weight**,
  **For** (Women/Men…), **Occasion** (Bridal, Wedding…). These auto-appear in the product
  page **Specifications** table.
- **Attributes** (key–value) for extras: Stones, Set Includes, Certification, Style, etc.
- **Price** — required by the form but **hidden publicly** in enquiry mode (enter any value).

---

## 8. Running the Site Locally (for development/testing)

The project folder: `C:\Users\Admin\Desktop\Parivar Jewellers`

**Easiest:** double-click **`start-all.bat`** → it starts MongoDB + backend + frontend and
opens `http://localhost:5173`. Keep the windows open while using it.

**Manual (VS Code terminals):**
```
Terminal 1:  cd backend    →  npm run dev     (API, port 5000)
Terminal 2:  cd frontend   →  npm run dev     (website, port 5173)
```
(MongoDB must be running — `start-mongodb.bat` handles it.)

> Local dev uses a **separate local database** — changes there do NOT affect the live site
> until pushed to GitHub. The live site uses MongoDB Atlas.

> If PowerShell blocks npm scripts, run once:
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

---

## 9. Making Changes Live

The live site deploys from GitHub automatically. To publish a change:
1. Edit the code.
2. `git add -A && git commit -m "..."` then `git push origin main`.
3. Render rebuilds and the change is live in ~3–5 minutes.

(During this project, all changes were made this way.)

---

## 10. Summary of Work Done (this project)

- ✅ Fixed password-reset flow (honest delivery, correct link, on-screen fallback).
- ✅ Shop filter panel styling; bigger header logo; removed Blog; added Policy page.
- ✅ **Full cloud deployment**: MongoDB Atlas + GitHub + Render, then connected the Hostinger
  domain **parivarjewellers.co.in** with SSL.
- ✅ Branding: tagline, footer text, phone, address, SEO/browser title, transparent logo + PJ
  favicon; address also shown in the footer.
- ✅ Mobile: categories/products shown as neat grids (no awkward horizontal scroll).
- ✅ **Category mega-menu** (6 groups) — replaced the demo categories.
- ✅ **Live Gold Rate** — top strip (24K/22K/18K), India-accurate, auto-updating; dedicated
  admin page; manual override; and a full-screen **showroom board** at `/gold-rate`.
- ✅ **Enquiry system** — Enquire button opens a form (Name/Email/Subject/Enquiry) that saves to
  Admin → Enquiries; added Subject field.
- ✅ Admin cleaned up for enquiry mode — Orders & Coupons hidden, enquiry-focused dashboard,
  Enquiries promoted to a top-level menu item.
- ✅ Product page auto-shows jewellery specs.

---

## 11. Support / Notes

- **Free-tier sleep:** first visit after idle takes ~40–50s. Upgrading the Render plan (paid)
  removes this.
- **Gold rate accuracy:** the automatic rate tracks the market and matches Indian rates closely;
  for an exact figure, use the manual rate in Admin → Gold Rate.
- **Domain DNS** is managed in Hostinger (hPanel → Domains → DNS/Nameservers).
- **Everything is reversible:** turning enquiry mode OFF in Settings brings back prices, cart,
  Orders and Coupons.

---

_Store: **Parivar Jewellers**, Mehsana, Gujarat · https://parivarjewellers.co.in_
