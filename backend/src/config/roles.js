// WordPress-style roles and a section-based capability matrix.

export const ROLES = ['super_admin', 'administrator', 'editor', 'author', 'contributor', 'subscriber'];

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  administrator: 'Administrator',
  editor: 'Editor',
  author: 'Author',
  contributor: 'Contributor',
  subscriber: 'Subscriber',
};

// Admin sections each role may access. 'super_admin' implicitly has everything.
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

// Can `role` access `section`?
export const can = (role, section) => {
  const caps = ROLE_CAPS[role] || [];
  return caps.includes('*') || caps.includes(section);
};

// Any role that can reach the admin area at all (i.e. has at least the dashboard).
export const isAdminRole = (role) => can(role, 'dashboard');
