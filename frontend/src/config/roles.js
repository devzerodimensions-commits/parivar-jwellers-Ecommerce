// Mirror of backend/src/config/roles.js — role labels, capabilities, helpers.

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  administrator: 'Administrator',
  editor: 'Editor',
  author: 'Author',
  contributor: 'Contributor',
  subscriber: 'Subscriber',
};

export const ROLES = Object.keys(ROLE_LABELS);

export const ROLE_CAPS = {
  super_admin: ['*'],
  administrator: [
    'dashboard', 'catalog', 'orders', 'users', 'coupons',
    'banners', 'blog', 'reviews', 'media', 'enquiries', 'pages', 'settings',
  ],
  editor: ['dashboard', 'catalog', 'banners', 'blog', 'reviews', 'media', 'enquiries', 'pages'],
  author: ['dashboard', 'blog', 'media'],
  contributor: ['dashboard', 'blog'],
  subscriber: [],
};

export const can = (role, section) => {
  const caps = ROLE_CAPS[role] || [];
  return caps.includes('*') || caps.includes(section);
};

export const isAdminRole = (role) => can(role, 'dashboard');

export const ROLE_BADGE = {
  super_admin: 'bg-purple-100 text-purple-700',
  administrator: 'bg-gold-100 text-gold-800',
  editor: 'bg-blue-100 text-blue-700',
  author: 'bg-teal-100 text-teal-700',
  contributor: 'bg-slate-100 text-slate-700',
  subscriber: 'bg-charcoal/10 text-charcoal/60',
};

export const roleLabel = (role) => ROLE_LABELS[role] || role;
