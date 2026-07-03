import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';

const typeFromUrl = (url = '') => {
  const u = url.split('?')[0].toLowerCase();
  if (u.endsWith('.svg')) return 'image/svg+xml';
  if (u.endsWith('.png')) return 'image/png';
  if (u.endsWith('.ico')) return 'image/x-icon';
  if (u.endsWith('.jpg') || u.endsWith('.jpeg')) return 'image/jpeg';
  if (u.endsWith('.webp')) return 'image/webp';
  return '';
};

// Apply a favicon href to the document <head>, replacing any existing icon links.
const applyFavicon = (href) => {
  document.querySelectorAll("link[rel~='icon']").forEach((l) => l.parentNode?.removeChild(l));
  const link = document.createElement('link');
  link.rel = 'icon';
  const type = typeFromUrl(href);
  if (type) link.type = type;
  link.href = href;
  document.head.appendChild(link);
};

/**
 * Syncs the browser-tab favicon with the admin-configured Settings → Favicon.
 * Renders nothing. Falls back to the bundled /favicon.svg when none is set.
 */
const FaviconManager = () => {
  const settings = useSettings();
  useEffect(() => {
    applyFavicon(settings.favicon || '/favicon.svg');
  }, [settings.favicon]);
  return null;
};

export default FaviconManager;
