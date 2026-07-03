# Jewelly — Full-Stack Dynamic Jewellery eCommerce (MERN)

A complete, production-ready jewellery eCommerce platform built with the **MERN** stack
(MongoDB · Express · React · Node.js). It includes a customer storefront, a full admin
panel, JWT authentication, cart/checkout, coupons, reviews, a blog/CMS, dynamic SEO, and a
seed script with a real jewellery catalogue.

> Themed as a premium gold/diamond/silver jewellery store (inspired by stores like
> Mahakali Jewellers). Sample data, categories and imagery are jewellery-specific.

---

## ✨ Features

**Storefront**
- Home with hero carousel, featured categories, featured/new/best-seller products, promo banner
- Shop with faceted filters (metal, gender, collection, price), search, sorting & pagination
- Category pages, product detail with gallery, variants, specs, reviews & related products
- Cart, coupon-aware checkout, order success, order tracking (by number + email)
- Wishlist, My Account (profile, addresses, orders, invoice download)
- Blog + CMS pages (About, Contact, FAQ accordion, policies)
- Newsletter signup, responsive design, lazy images, skeleton loaders

**Admin panel** (`/admin`, admin role only)
- Dashboard: revenue, orders, customers, 30-day sales chart, low-stock & recent orders
- Products (full CRUD, image upload, variants, attributes, SEO, stock, flags)
- Categories, Brands, Coupons, Banners — CRUD
- Orders: status workflow, tracking, mark-paid
- Customers (enable/disable), Reviews moderation
- Blog editor, Website Settings (logo, theme, contact, SMTP, shipping, tax, SEO, footer)

**Platform**
- JWT auth (register / login / forgot / reset), bcrypt, role-based access (customer/admin)
- Security: Helmet, CORS, rate limiting, server-side input validation, server-side re-pricing
- SEO: per-page meta + Open Graph, dynamic `/sitemap.xml` and `/robots.txt`
- REST API for every module, image uploads via Multer

---

## 🧱 Tech Stack

| Layer | Tech |
|------|------|
| Frontend | React 18, Vite, React Router, Tailwind CSS, Axios, react-helmet-async, react-hot-toast |
| Backend | Node.js, Express, Mongoose, JWT, bcryptjs, Multer, Nodemailer, Helmet |
| Database | MongoDB (local or Atlas) |

---

## 📋 Prerequisites

- **Node.js 18+ and npm** — verify with `node -v` and `npm -v`.
  Download from <https://nodejs.org> (the installer bundles npm).
- **MongoDB** — either a local `mongod`, or a free **MongoDB Atlas** cluster
  (<https://www.mongodb.com/atlas>). Copy the connection string.

---

## 🚀 Getting Started (local)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then edit .env (see below)
npm run seed                # loads the jewellery catalogue + admin user
npm run dev                 # starts the API on http://localhost:5000
```

Edit `backend/.env`:

```ini
MONGO_URI=mongodb://127.0.0.1:27017/jewelly      # or your Atlas SRV string
JWT_SECRET=<a long random string>
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:5000
ADMIN_EMAIL=admin@jewelly.com
ADMIN_PASSWORD=Admin@123
# Optional SMTP for real password-reset / order emails (else logged to console)
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # default VITE_API_URL=/api works with the dev proxy
npm run dev                 # starts the SPA on http://localhost:5173
```

Open <http://localhost:5173>.

### Demo logins (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@jewelly.com` | `Admin@123` |
| Customer | `customer@jewelly.com` | `Customer@123` |

Admin panel: <http://localhost:5173/admin>

---

## 📁 Project Structure

```
jewelly-code/
├── backend/
│   ├── server.js                # entry point
│   └── src/
│       ├── app.js               # express app, middleware, routes, sitemap/robots
│       ├── config/db.js         # MongoDB connection
│       ├── models/              # Mongoose models (User, Product, Order, …)
│       ├── controllers/         # business logic per module
│       ├── routes/              # REST routes per module + index.js
│       ├── middleware/          # auth, error, validate, upload, asyncHandler
│       └── utils/               # token, email, apiFeatures, seed, seedImages
│   └── uploads/                 # uploaded & generated images (served at /uploads)
└── frontend/
    ├── index.html, vite.config.js, tailwind.config.js
    └── src/
        ├── main.jsx, App.jsx    # providers + router
        ├── api/axios.js         # axios instance + JWT interceptor
        ├── context/             # Auth, Cart, Wishlist, Settings providers
        ├── components/          # ProductCard, layout, ui/, admin/
        ├── pages/               # storefront + auth + account pages
        └── pages/admin/         # admin panel pages
```

---

## 🔌 API Overview

Base URL: `http://localhost:5000/api`

| Resource | Endpoints (selected) |
|---------|----------------------|
| Auth | `POST /auth/register`, `/auth/login`, `/auth/forgot-password`, `PUT /auth/reset-password/:token`, `GET /auth/me` |
| Products | `GET /products`, `/products/filters`, `/products/featured`, `/products/:slug`, admin CRUD |
| Categories / Brands | `GET /categories`, `/brands` + admin CRUD |
| Orders | `POST /orders`, `GET /orders/mine`, `GET /orders/track/:orderNumber`, admin status/pay |
| Cart aids | `POST /coupons/validate` |
| Reviews | `GET/POST /products/:id/reviews`, admin moderation |
| Content | `GET /blogs`, `/pages`, `/banners` + admin CRUD |
| Misc | `POST /subscribers`, `GET /settings`, `GET /dashboard/stats` (admin), `POST /upload` |
| SEO | `GET /sitemap.xml`, `GET /robots.txt` |

All responses are JSON shaped as `{ success, ... }`. Errors return `{ success: false, message }`.

---

## ☁️ Deployment

**Database — MongoDB Atlas**
1. Create a free cluster, a DB user, and allow your server IP.
2. Use the SRV connection string as `MONGO_URI`.

**Backend — VPS (or Render/Railway)**
1. Set all `.env` variables (`NODE_ENV=production`, real `JWT_SECRET`, `CLIENT_URL` = your frontend URL, `API_URL` = your API URL).
2. `npm install && npm run seed` (once), then run with a process manager: `pm2 start server.js --name jewelly-api`.
3. Put Nginx in front for TLS and proxy `:5000`.

**Frontend — Vercel**
1. Import the `frontend/` folder; framework preset **Vite**.
2. Set `VITE_API_URL=https://your-api-domain/api`.
3. `vercel.json` already rewrites all routes to `index.html` for the SPA.

---

## 🛠️ Useful Scripts

| Location | Command | Description |
|----------|---------|-------------|
| backend | `npm run dev` | API with nodemon |
| backend | `npm start` | API (production) |
| backend | `npm run seed` | Wipe + load demo catalogue |
| backend | `npm run seed:destroy` | Wipe all data |
| frontend | `npm run dev` | Vite dev server |
| frontend | `npm run build` | Production build to `dist/` |
| frontend | `npm run preview` | Preview the production build |

---

## ▶️ Running on this machine (already set up)

Everything is installed and seeded. To start the app after a reboot, open **three** terminals:

1. **MongoDB** — double-click `start-mongodb.bat` (or run it) and leave it open.
   *(Uses portable MongoDB 8.0 at `C:\Users\Admin\mongodb80`, data in `C:\Users\Admin\mongodb-data`. The winget-installed 8.3 service doesn't run on this Windows build, so we use this instead.)*
2. **Backend** — `cd backend && npm run dev`
3. **Frontend** — `cd frontend && npm run dev`, then open <http://localhost:5173>.

> If a terminal can't find `node`/`npm`, open a **new** terminal (PATH refreshes there) or run
> `set "PATH=C:\Program Files\nodejs;%PATH%"` first.

Reload demo data anytime: `cd backend && npm run seed`.

---

## 📝 Notes

- **Product images** are branded SVGs generated by the seed (`src/utils/seedImages.js`)
  and served from `/uploads/seed`, so the store looks complete with zero external image
  dependencies. Replace them anytime via the admin product editor (upload or paste a URL).
- **Payments** are simulated (orders are created unpaid; admins can mark them paid).
  Integrate Razorpay/Stripe in `orderController.createOrder` when going live.
- **Emails**: without SMTP configured, password-reset/order emails are printed to the
  backend console for easy local testing.
