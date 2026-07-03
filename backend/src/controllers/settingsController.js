import asyncHandler from '../middleware/asyncHandler.js';
import Settings from '../models/Settings.js';

// Public-safe view of settings (omits SMTP credentials).
const publicSettings = (s) => {
  const obj = s.toObject();
  delete obj.smtp;
  return obj;
};

// @route GET /api/settings  (public)
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.json({ success: true, settings: publicSettings(settings) });
});

// @route GET /api/settings/admin  (admin) — full settings incl. SMTP
export const getSettingsAdmin = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.json({ success: true, settings });
});

// @route PUT /api/settings  (admin)
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  // Merge nested objects without clobbering unspecified keys.
  const merge = (target, source) => {
    for (const key of Object.keys(source)) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === 'object'
      ) {
        merge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  };
  merge(settings, req.body);
  delete settings.key; // never let the singleton key change
  settings.key = 'global';
  await settings.save();
  res.json({ success: true, settings });
});
