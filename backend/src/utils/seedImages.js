import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_DIR = path.join(__dirname, '..', '..', 'uploads', 'seed');

// Store root-relative /uploads URLs so images work on any domain
// (localhost, tunnel, or a deployed host).
const API = '';

// Material → colour palette for generated artwork.
const PALETTES = {
  gold: { bg1: '#FBF4E0', bg2: '#EFD9A1', accent: '#B8860B', ink: '#4A3B12', gem: '#C8A04B' },
  diamond: { bg1: '#EEF4F8', bg2: '#CFE0EA', accent: '#2E4756', ink: '#1A2A33', gem: '#BFE3F2' },
  silver: { bg1: '#F1F3F5', bg2: '#D7DCE1', accent: '#5B6770', ink: '#2B3137', gem: '#E6EBEF' },
  'gold-coins': { bg1: '#FCEDB6', bg2: '#E7C25A', accent: '#9C6B0B', ink: '#5A3D08', gem: '#FFD964' },
  bridal: { bg1: '#7A1B2E', bg2: '#561020', accent: '#E9C46A', ink: '#FBE9C6', gem: '#F2D27C' },
  gifts: { bg1: '#15392E', bg2: '#0E261F', accent: '#E9C46A', ink: '#EAF3EE', gem: '#F2D27C' },
};

const pal = (key) => PALETTES[key] || PALETTES.gold;

// ---- Jewelry glyphs drawn with plain SVG primitives ----
const glyphs = {
  ring: (c) => `
    <circle cx="400" cy="470" r="150" fill="none" stroke="${c.accent}" stroke-width="34"/>
    <g transform="translate(400,250)">
      <polygon points="0,-60 52,-18 0,60 -52,-18" fill="${c.gem}" stroke="${c.accent}" stroke-width="6"/>
      <polygon points="0,-60 52,-18 0,0 -52,-18" fill="#ffffff" opacity="0.45"/>
    </g>`,
  diamond: (c) => `
    <g transform="translate(400,420)">
      <polygon points="-150,-70 150,-70 230,0 0,250 -230,0" fill="${c.gem}" stroke="${c.accent}" stroke-width="8"/>
      <polygon points="-150,-70 150,-70 0,0" fill="#ffffff" opacity="0.5"/>
      <polygon points="-150,-70 0,0 -230,0" fill="#ffffff" opacity="0.25"/>
      <line x1="0" y1="0" x2="0" y2="250" stroke="${c.accent}" stroke-width="4" opacity="0.6"/>
    </g>`,
  necklace: (c) => `
    <path d="M180 240 Q400 540 620 240" fill="none" stroke="${c.accent}" stroke-width="16" stroke-linecap="round"/>
    <path d="M180 240 Q400 560 620 240" fill="none" stroke="${c.gem}" stroke-width="6" stroke-dasharray="2 14" stroke-linecap="round"/>
    <g transform="translate(400,470)">
      <polygon points="0,-44 38,-8 0,60 -38,-8" fill="${c.gem}" stroke="${c.accent}" stroke-width="6"/>
    </g>`,
  earring: (c) => `
    ${[290, 510].map((x) => `
      <circle cx="${x}" cy="250" r="16" fill="none" stroke="${c.accent}" stroke-width="10"/>
      <line x1="${x}" y1="266" x2="${x}" y2="360" stroke="${c.accent}" stroke-width="8"/>
      <circle cx="${x}" cy="410" r="46" fill="${c.gem}" stroke="${c.accent}" stroke-width="8"/>
      <circle cx="${x - 14}" cy="396" r="12" fill="#ffffff" opacity="0.5"/>`).join('')}`,
  bangle: (c) => `
    <ellipse cx="400" cy="430" rx="190" ry="150" fill="none" stroke="${c.accent}" stroke-width="40"/>
    <ellipse cx="400" cy="430" rx="190" ry="150" fill="none" stroke="${c.gem}" stroke-width="8" stroke-dasharray="3 22"/>`,
  chain: (c) => `
    <g stroke="${c.accent}" stroke-width="14" fill="none">
      ${Array.from({ length: 7 }, (_, i) => `<ellipse cx="${250 + i * 50}" cy="${300 + (i % 2) * 60}" rx="34" ry="22"/>`).join('')}
    </g>`,
  coin: (c) => `
    <circle cx="400" cy="420" r="180" fill="${c.gem}" stroke="${c.accent}" stroke-width="14"/>
    <circle cx="400" cy="420" r="150" fill="none" stroke="${c.accent}" stroke-width="4" opacity="0.6"/>
    <text x="400" y="400" text-anchor="middle" font-family="Georgia, serif" font-size="64" font-weight="700" fill="${c.ink}">999</text>
    <text x="400" y="470" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="${c.ink}">GOLD</text>`,
};

const ensureDir = () => {
  if (!fs.existsSync(SEED_DIR)) fs.mkdirSync(SEED_DIR, { recursive: true });
};

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50);

const writeSvg = (filename, svg) => {
  ensureDir();
  fs.writeFileSync(path.join(SEED_DIR, filename), svg.trim());
  return `${API}/uploads/seed/${filename}`;
};

/**
 * Generate a square product image and return its public URL.
 */
export const productImage = (name, glyph = 'ring', material = 'gold', label = '') => {
  const c = pal(material);
  const g = (glyphs[glyph] || glyphs.ring)(c);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${c.bg1}"/>
        <stop offset="1" stop-color="${c.bg2}"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.5" cy="0.42" r="0.5">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="800" height="800" fill="url(#bg)"/>
    <ellipse cx="400" cy="400" rx="360" ry="360" fill="url(#glow)"/>
    ${g}
    <text x="400" y="690" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" font-weight="600" fill="${c.ink}">${escapeXml(
      name
    )}</text>
    ${label ? `<text x="400" y="730" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="${c.accent}" letter-spacing="3">${escapeXml(
      label.toUpperCase()
    )}</text>` : ''}
  </svg>`;
  return writeSvg(`product-${slugify(name)}.svg`, svg);
};

/**
 * Generate a wide hero/category banner and return its URL.
 */
export const bannerImage = (title, subtitle, material = 'bridal', file) => {
  const c = pal(material);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="640" viewBox="0 0 1600 640">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${c.bg1}"/>
        <stop offset="1" stop-color="${c.bg2}"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="640" fill="url(#bg)"/>
    <!-- Artwork only: titles/subtitles are rendered by the UI as an overlay, so they are
         intentionally NOT baked into the image (avoids duplicated text). -->
    <g opacity="0.95" transform="translate(1140,300) scale(1.05)">${glyphs.diamond(c)}</g>
    <g opacity="0.9" transform="translate(1390,360) scale(0.7)">${glyphs.ring(c)}</g>
  </svg>`;
  return writeSvg(file || `banner-${slugify(title)}.svg`, svg);
};

/**
 * Square category tile image.
 */
export const categoryImage = (name, glyph, material) => {
  const c = pal(material);
  const g = (glyphs[glyph] || glyphs.ring)(c);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 800 800">
    <rect width="800" height="800" fill="${c.bg1}"/>
    <circle cx="400" cy="400" r="300" fill="${c.bg2}" opacity="0.55"/>
    ${g}
    <text x="400" y="700" text-anchor="middle" font-family="Georgia, serif" font-size="40" font-weight="600" fill="${c.ink}">${escapeXml(
      name
    )}</text>
  </svg>`;
  return writeSvg(`category-${slugify(name)}.svg`, svg);
};

/**
 * Brand / store wordmark logo.
 */
export const logoImage = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="90" viewBox="0 0 320 90">
    <g transform="translate(40,45)">
      <polygon points="0,-22 18,-6 0,24 -18,-6" fill="#C8A04B" stroke="#9C6B0B" stroke-width="2"/>
      <polygon points="0,-22 18,-6 0,0 -18,-6" fill="#ffffff" opacity="0.5"/>
    </g>
    <text x="78" y="56" font-family="Georgia, serif" font-size="42" font-weight="700" fill="#C8A04B" letter-spacing="2">Jewelly</text>
  </svg>`;
  return writeSvg('logo.svg', svg);
};

function escapeXml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
