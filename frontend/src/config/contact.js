/**
 * Single source of truth for the "Call for Enquiry" phone number.
 *
 * Change it in ONE place:
 *   - set VITE_ENQUIRY_PHONE in frontend/.env  (preferred), or
 *   - edit the fallback constant below.
 *
 * Used by every Enquiry button across the site.
 */
export const ENQUIRY_PHONE = import.meta.env.VITE_ENQUIRY_PHONE || '+91 82829 69651';

// Dialer-safe tel: href — keep only digits and an optional leading "+".
export const ENQUIRY_TEL_HREF = `tel:${ENQUIRY_PHONE.replace(/[^\d+]/g, '')}`;
