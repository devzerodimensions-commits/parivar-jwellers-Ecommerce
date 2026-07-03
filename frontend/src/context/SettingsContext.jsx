import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios.js';

const SettingsContext = createContext(null);

// Sensible defaults so the UI renders before settings load.
const DEFAULTS = {
  siteName: 'Parivar Jewellers',
  tagline: 'Timeless Jewellery, Crafted for You',
  logo: '',
  currency: { code: 'INR', symbol: '₹' },
  contact: { email: 'support@jewelly.com', phone: '+91 90000 00000', address: '' },
  social: {},
  shipping: { freeShippingThreshold: 5000, flatRate: 99 },
  tax: { rate: 3 },
  enquiryMode: false,
  footer: { aboutText: '', copyright: '© Jewelly' },
  announcements: [],
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => setSettings({ ...DEFAULTS, ...res.data.settings }))
      .catch(() => {});
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext);
