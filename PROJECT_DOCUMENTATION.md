# Parivar Jewellers — Project Documentation

A complete, production-ready **full-stack jewellery eCommerce platform** (MERN) with a
customer storefront and a WordPress-style admin panel — including role-based user management,
two-factor authentication, a media library with an image editor, an enquiry mode, dynamic SEO,
and single-origin deployment.

- **Repository root:** `C:\Users\Admin\Desktop\jewelly-code`
- **Store name:** Parivar Jewellers (configurable in Admin → Settings)
- **Stack:** MongoDB · Express · React · Node.js (MERN)

---

## Table of Contents
1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Feature Summary](#3-feature-summary)
4. [Architecture](#4-architecture)
5. [Folder Structure](#5-folder-structure)
6. [Roles & Permissions](#6-roles--permissions)
7. [Demo Accounts](#7-demo-accounts)
8. [Data Model (Collections)](#8-data-model-collections)
9. [REST API Reference](#9-rest-api-reference)
10. [Environment Variables](#10-environment-variables)
11. [Running Locally](#11-running-locally)
12. [Deployment](#12-deployment)
13. [Security](#13-security)
14. [Admin Panel Guide](#14-admin-panel-guide)
15. [Storefront Guide](#15-storefront-guide)
16. [Helper Scripts & Files](#16-helper-scripts--files)

---

## 1. Overview

Parivar Jewellers is a themed jewellery store (gold / diamond / silver) built as two apps that
run together:

- **Backend** (`backend/`) — a Node.js + Express REST API backed by MongoDB (Mongoose). Handles
  authentication, all business logic, file uploads, and — in production — also serves the built
  frontend so the whole app runs from **one URL**.
- **Frontend** (`frontend/`) — a React (Vite) single-page app with Tailwind CSS. Contains the
  customer storefront and the admin panel.

Product/catalogue imagery is generated as branded SVGs at seed time (no external image
dependencies), and all stored image URLs are **root-relative** so the site works on any domain.

---

## 2. Tech Stack

### Backend
| Purpose | Library |
|--------|---------|
| Server | express |
| Database / ODM | mongoose (MongoDB) |
| Auth | jsonwebtoken, bcryptjs |
| Two-factor | otplib (TOTP), qrcode |
| Validation | express-validator |
| Uploads | multer |
| Email | nodemailer |
| Security | helmet, cors, express-rate-limit, cookie-parser |
| Misc | dotenv, compression, morgan, slugify |

### Frontend
| Purpose | Library |
|--------|---------|
| UI | react, react-dom |
| Build | vite, @vitejs/plugin-react |
| Styling | tailwindcss, postcss, autoprefixer |
| Routing | react-router-dom |
| HTTP | axios |
| SEO | react-helmet-async |
| Notifications | react-hot-toast |
| Icons | react-icons |
| Image cropping | react-easy-crop |

---

## 3. Feature Summary

### Storefront
- Home with hero **carousel**, **category slider**, and **product sliders** (Featured / New / Best sellers)
- Shop with faceted **filters** (metal, gender, collection, price), **search**, **sorting**, pagination
- Category pages, product detail (image gallery, variants, specs, **reviews**, related products)
- **Cart**, coupon-aware **checkout**, order success, **order tracking**
- **Wishlist**, **My Account** (profile, addresses, orders, invoice download, 2FA)
- **Blog** + CMS pages (About, Contact, FAQ, policies)
- Newsletter signup, responsive design, lazy images, skeleton loaders
- **Enquiry mode** (optional): hides prices and shows a **Call for Enquiry** button (`tel:` dialer)

### Admin panel
- Dashboard (revenue, orders, customers, new enquiries, 30-day sales chart, low stock, recent orders)
- **Products** (full CRUD, variants, attributes, images, SEO, stock), **Categories**, **Brands**
- **Orders** (status workflow, tracking, mark paid), **Coupons**, **Enquiries**
- **Banners**, **Blog** editor, **Reviews** moderation, **CMS pages**
- **Media Library** — upload, **crop / resize / replace** (image editor), copy URL, bulk delete
- **Users** — WordPress-style user management (see §6)
- **Settings** — logo/favicon (with editor), theme, contact, social, SMTP, shipping/tax, SEO, footer, enquiry mode

### Platform / security
- JWT auth (register / login / forgot / reset), bcrypt password hashing
- **Two-Factor Authentication** — email OTP **or** authenticator app (TOTP + QR)
- **Role-based permissions** (6 roles, per-section capabilities)
- Helmet, CORS, rate limiting, server-side validation, server-side re-pricing on checkout
- Dynamic `sitemap.xml` and `robots.txt`, per-page meta + Open Graph

---

## 4. Architecture

**Development:** two dev servers.
- Vite dev server on **:5173** (the SPA, with hot-reload) — proxies `/api` and `/uploads` to the backend.
- Express API on **:5000**.

**Production / sharing (single-origin):** one server.
- `backend/src/app.js` serves the built `frontend/dist` + `/api` + `/uploads` all from **:5000**.
- All image URLs are root-relative (`/uploads/...`), so the app works on `localhost`, a tunnel,
  or any deployed host without changes.

```
Browser ──▶ Express (:5000) ──┬── /api/*        → REST API
                              ├── /uploads/*    → images
                              └── /*            → React SPA (index.html)
                                                     │
                                              MongoDB (:27017 / Atlas)
```

---

## 5. Folder Structure

```
jewelly-code/
├── backend/
│   ├── server.js                  # entry point
│   └── src/
│       ├── app.js                 # express app: middleware, routes, static, SPA fallback
│       ├── config/
│       │   ├── db.js              # MongoDB connection
│       │   └── roles.js           # roles + capability matrix
│       ├── models/                # Mongoose schemas (User, Product, Order, Enquiry, …)
│       ├── controllers/           # business logic per module
│       ├── routes/                # REST routes per module + index.js
│       ├── middleware/            # auth (protect/admin/requireCap), error, validate, upload
│       └── utils/                 # token, email, twoFactor, seed, seedImages
│   └── uploads/                   # uploaded + generated images (served at /uploads)
└── frontend/
    ├── index.html, vite.config.js, tailwind.config.js
    └── src/
        ├── main.jsx, App.jsx      # providers + router
        ├── api/axios.js           # axios instance + JWT interceptor
        ├── config/roles.js        # mirror of backend roles/capabilities
        ├── context/               # Auth, Cart, Wishlist, Settings providers
        ├── components/            # ProductCard, Carousel, auth/, admin/, …
        ├── pages/                 # storefront + auth + account pages
        └── pages/admin/           # admin panel pages
```

---

## 6. Roles & Permissions

Six WordPress-style roles. Each role can access a set of admin **sections** (capabilities).
`super_admin` implicitly has everything.

| Section \ Role | Super Admin | Administrator | Editor | Author | Contributor | Subscriber |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Catalog (products/categories/brands) | ✅ | ✅ | ✅ | — | — | — |
| Orders | ✅ | ✅ | — | — | — | — |
| Coupons | ✅ | ✅ | — | — | — | — |
| Enquiries | ✅ | ✅ | ✅ | — | — | — |
| Banners | ✅ | ✅ | ✅ | — | — | — |
| Blog | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Reviews | ✅ | ✅ | ✅ | — | — | — |
| Media | ✅ | ✅ | ✅ | ✅ | — | — |
| Pages (CMS) | ✅ | ✅ | ✅ | — | — | — |
| Users | ✅ | ✅ | — | — | — | — |
| Settings | ✅ | ✅ | — | — | — | — |

**Enforcement** is on both ends:
- **Backend:** `requireCap('<section>')` middleware guards every admin route group.
- **Frontend:** the admin sidebar hides sections a role cannot access, and pages block direct access.

Source of truth: `backend/src/config/roles.js` (mirrored in `frontend/src/config/roles.js`).

Guards: you cannot delete/deactivate/demote **yourself**; only a **Super Admin** can create, edit, or
delete another Super Admin.

---

## 7. Demo Accounts

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Super Admin | `admin@jewelly.com` | `Admin@123` | Full access |
| Subscriber (customer) | `customer@jewelly.com` | `Customer@123` | Storefront only |
| Administrator / Editor / Author | `manager@ / editor@ / author@jewelly.com` | `Password@123` | Seeded sample staff (set **inactive** on the live link) |

> The admin panel is at **`/admin/login`**. 2FA is **off by default** (opt-in per user under Account → Two-Factor Authentication).

---

## 8. Data Model (Collections)

| Collection | Key fields |
|-----------|-----------|
| **User** | name, username, email, password (bcrypt), phone, role, avatar, isActive, lastLogin, addresses[], wishlist[], 2FA fields |
| **Product** | name, slug, sku (optional), price, salePrice, category, brand, images[], stock, variants[], attributes[], material, purity, weight, gender, ratings, flags, SEO |
| **Category** | name, slug, image, parent, isFeatured, order, SEO |
| **Brand** | name, slug, logo, isActive |
| **Order** | orderNumber, user, items[], addresses, paymentMethod/status, totals, status, statusHistory[], tracking |
| **Review** | product, user, rating, title, comment, isApproved, isVerifiedPurchase |
| **Coupon** | code, type, value, minPurchase, maxDiscount, usageLimit, expiresAt |
| **Banner** | title, image, link, position (hero/promo), order, isActive |
| **Blog** | title, slug, excerpt, content, coverImage, author, tags, isPublished, views |
| **CmsPage** | title, slug, content, type (page/faq/policy), faqs[] |
| **Settings** | siteName, logo, favicon, theme, contact, social, smtp, currency, shipping, tax, seo, footer, **enquiryMode** |
| **Subscriber** | email, isActive |
| **Enquiry** | product, name, email, phone, message, status |

---

## 9. REST API Reference

Base URL: `/api` (same origin). Responses are JSON shaped `{ success, ... }`; errors return
`{ success:false, message }`.

### Auth — `/api/auth`
| Method | Path | Purpose |
|---|---|---|
| POST | `/register` | Create account |
| POST | `/login` | Sign in (returns `requires2FA` + challenge if 2FA on) |
| POST | `/verify-2fa` | Complete 2FA login `{ challenge, code }` |
| POST | `/logout` · GET `/me` | Session |
| POST | `/forgot-password` · PUT `/reset-password/:token` | Password reset |
| GET | `/2fa` | 2FA status |
| POST | `/2fa/email/enable` · `/2fa/app/setup` · `/2fa/app/verify` · `/2fa/disable` | Manage 2FA |

### Users — `/api/users`
| Method | Path | Access |
|---|---|---|
| PUT | `/profile` · `/password` | self |
| POST | `/avatar` | self (own photo) |
| GET/POST | `/addresses` · PUT/DELETE `/addresses/:id` | self |
| GET/POST | `/wishlist` · `/wishlist/:productId` | self |
| GET | `/` | users cap — list (search/filter/pagination) |
| POST | `/` | users cap — create |
| GET/PUT/DELETE | `/:id` | users cap — view/edit/delete |
| POST | `/bulk-delete` | users cap — bulk delete |
| GET | `/meta/roles` | users cap — role options |

### Catalog & content
| Resource | Public | Admin (capability) |
|---|---|---|
| `/products`, `/categories`, `/brands` | list / detail | CRUD (`catalog`) |
| `/orders` | create, `/track/:orderNumber`, `/mine` | list/status/pay (`orders`) |
| `/coupons/validate` | validate | CRUD (`coupons`) |
| `/enquiries` | submit | list/update/delete (`enquiries`) |
| `/banners`, `/blogs`, `/pages`, `/reviews` | list / detail | CRUD (`banners`/`blog`/`pages`/`reviews`) |
| `/media` | — | list/upload/save/delete (`media`) |
| `/settings` | public read | update (`settings`) |
| `/subscribers` | subscribe | list (`users`) |
| `/dashboard/stats` | — | admin |
| `/upload` | — | admin (image upload) |

### SEO
`GET /sitemap.xml` · `GET /robots.txt`

---

## 10. Environment Variables

### `backend/.env`
```ini
NODE_ENV=development            # or production (serves the built frontend)
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/jewelly     # or a MongoDB Atlas SRV string
JWT_SECRET=<long random string>
JWT_EXPIRES_IN=7d
API_URL=http://localhost:5000
ADMIN_NAME=Store Admin
ADMIN_EMAIL=admin@jewelly.com
ADMIN_PASSWORD=Admin@123
# Optional SMTP (else emails/OTPs are logged to the server console)
SMTP_HOST= SMTP_PORT=587 SMTP_USER= SMTP_PASS= SMTP_FROM=
# Optional
TWOFA_ISSUER=Parivar Jewellers
```

### `frontend/.env`
```ini
VITE_API_URL=/api                 # relative — proxied in dev, same-origin in prod
VITE_ENQUIRY_PHONE=+919876543210  # number used by the "Call for Enquiry" button
```

---

## 11. Running Locally

**Prerequisites:** Node.js 18+ (with npm) and MongoDB (local or Atlas).

```bash
# Backend
cd backend
npm install
cp .env.example .env         # then edit values
npm run seed                 # load demo catalogue + admin user
npm run dev                  # API on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev                  # SPA on http://localhost:5173
```

Open <http://localhost:5173>. Admin at `/admin/login`.

**One-click (Windows):** double-click **`start-all.bat`** in the project root — it starts MongoDB,
the backend, and the frontend, and opens the site.

---

## 12. Deployment

The app is **deployment-ready** (single-origin serving + relative image URLs).

**Option A — Instant public link (temporary):** `share-online.bat` builds the site, runs the
server, and starts a Cloudflare quick tunnel → a public `https://…trycloudflare.com` URL. Works
while the PC + windows stay open; the URL changes each run.

**Option B — Permanent (recommended):** deploy to a host with a database. Simplest is
**MongoDB Atlas** (free DB) + **Render** (one Node web service that also serves the frontend).
Full step-by-step in **`DEPLOY.md`**.

Production build: `npm run build --prefix frontend`, then run the backend with `NODE_ENV=production`.

---

## 13. Security

- **Passwords:** bcrypt-hashed (never stored or returned in plaintext).
- **JWT:** stored in `localStorage` + an httpOnly cookie; the auth middleware rejects pre-2FA
  "challenge" tokens so they can't be used as full sessions.
- **Two-Factor Authentication:** email OTP (10-min expiry) or authenticator app (TOTP with QR);
  enable/disable in Account settings; disabling requires the password.
- **Show/Hide password** on all login and user forms.
- **Role-based access** enforced server-side (`requireCap`) — the UI gating is convenience only.
- **Hardening:** Helmet headers, CORS allow-list, rate limiting on `/api`, server-side input
  validation, and **server-side re-pricing** at checkout (client prices are never trusted).
- **Last login** timestamp recorded and shown in the Users table.

---

## 14. Admin Panel Guide

Open **`/admin/login`** → sign in. The left sidebar (filtered by your role) contains:

- **Dashboard** — KPIs, sales chart, low stock, recent orders, pending enquiries.
- **Products** — All Products (CRUD), Categories, Brands.
- **Sales** — Orders (status/tracking/paid), Coupons, Enquiries.
- **Content** — Banners, Blog, Reviews.
- **Media** — upload, edit (crop/resize/replace), copy URL, bulk delete.
- **Users** — list (search/filter/bulk), Add/Edit (role, status, photo, password), View.
- **Settings** — branding (logo/favicon with editor), theme, contact/social, SMTP, shipping/tax,
  SEO, footer, and the **Enquiry mode** toggle.

Admin authentication (login, forgot password, reset password) uses a dedicated standalone
**AuthLayout** with no storefront chrome.

---

## 15. Storefront Guide

- **Home** `/` — hero carousel, category slider, product sliders, promo, trust badges.
- **Shop** `/shop` — filters, sort, pagination. **Category** `/category/:slug`. **Search** `/search`.
- **Product** `/product/:slug` — gallery, variants, specs, reviews, related; **Add to Cart** or
  (in enquiry mode) a **Call for Enquiry** button.
- **Cart** `/cart` → **Checkout** `/checkout` (address, payment, coupon) → order success.
- **Track Order** `/track-order`, **Wishlist** `/wishlist`.
- **My Account** `/account` — profile + photo, password, addresses, orders (+ invoice), **2FA**.
- **Blog** `/blog`, **Pages** `/page/:slug` (About/Contact/FAQ/policies).

---

## 16. Helper Scripts & Files

| File (project root) | Purpose |
|---|---|
| `start-all.bat` | Start MongoDB + backend + frontend (dev) and open the site |
| `start-mongodb.bat` | Start the local MongoDB only |
| `share-online.bat` | Build + serve + Cloudflare tunnel → temporary public link |
| `README.md` | Quick setup & run |
| `DEPLOY.md` | Permanent deployment guide |
| `PROJECT_DOCUMENTATION.md` | This document |

| npm script | Location | Purpose |
|---|---|---|
| `npm run dev` | backend / frontend | Dev server |
| `npm start` | backend | Production server (serves the built frontend) |
| `npm run seed` / `seed:destroy` | backend | Load / wipe demo data |
| `npm run build` | frontend | Production build to `dist/` |

---

*Document generated for the Parivar Jewellers project. Update as features evolve.*
