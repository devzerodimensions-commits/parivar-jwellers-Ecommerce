import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import routes from './routes/index.js';
import { sitemap, robots } from './controllers/seoController.js';
import { notFound, errorHandler } from './middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ---- Security & core middleware ----
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images to load on the SPA origin
  })
);
app.use(
  cors({
    origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','),
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ---- Rate limiting (auth + general API) ----
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// ---- Static: uploaded images ----
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Jewelly API is healthy', time: new Date().toISOString() });
});

// ---- SEO: dynamic sitemap & robots ----
app.get('/sitemap.xml', sitemap);
app.get('/robots.txt', robots);

// ---- API routes ----
app.use('/api', routes);

// ---- Serve the built frontend (single-origin) when it exists ----
// This lets the whole app run on ONE URL — required for deployment / tunnels.
const clientDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist));
  // SPA fallback: send index.html for any non-API, non-upload GET route.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ---- 404 + error handling ----
app.use(notFound);
app.use(errorHandler);

export default app;
