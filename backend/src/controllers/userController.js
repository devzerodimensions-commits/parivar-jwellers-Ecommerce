import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.js';
import { ROLES, ROLE_LABELS } from '../config/roles.js';

// ---------- Profile ----------

// @route PUT /api/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, phone, avatar } = req.body;
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;
  await user.save();
  res.json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar },
  });
});

// @route PUT /api/users/password
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect.');
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated.' });
});

// ---------- Addresses ----------

// @route GET /api/users/addresses
export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, addresses: user.addresses });
});

// @route POST /api/users/addresses
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  if (user.addresses.length === 0) req.body.isDefault = true;
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

// @route PUT /api/users/addresses/:addressId
export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) {
    res.status(404);
    throw new Error('Address not found.');
  }
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  address.set(req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// @route DELETE /api/users/addresses/:addressId
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) {
    res.status(404);
    throw new Error('Address not found.');
  }
  address.deleteOne();
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// ---------- Wishlist ----------

// @route GET /api/users/wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    populate: { path: 'category brand', select: 'name slug' },
  });
  res.json({ success: true, wishlist: user.wishlist });
});

// @route POST /api/users/wishlist/:productId  (toggle)
export const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { productId } = req.params;
  const index = user.wishlist.findIndex((id) => id.toString() === productId);
  let added;
  if (index > -1) {
    user.wishlist.splice(index, 1);
    added = false;
  } else {
    user.wishlist.push(productId);
    added = true;
  }
  await user.save();
  res.json({ success: true, added, wishlist: user.wishlist });
});

// ---------- Admin: user management ----------

// Fields safe to return to the admin (no password / 2FA secrets — they are select:false).
const ADMIN_USER_FIELDS =
  'name username email phone role avatar isActive lastLogin twoFactorEnabled createdAt updatedAt';

// Only a Super Admin may create/assign the Super Admin role.
const canAssignRole = (actorRole, targetRole) =>
  !(targetRole === 'super_admin' && actorRole !== 'super_admin');

// @route GET /api/users  (users cap) — search, filter (role/status), pagination
export const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 15);
  const filter = {};
  if (req.query.search) {
    const rx = { $regex: req.query.search.trim(), $options: 'i' };
    filter.$or = [{ name: rx }, { username: rx }, { email: rx }, { phone: rx }];
  }
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'inactive') filter.isActive = false;

  const [users, total, roleCounts] = await Promise.all([
    User.find(filter).select(ADMIN_USER_FIELDS).sort('-createdAt').skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
  ]);

  res.json({
    success: true,
    count: users.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    users,
    roleCounts: Object.fromEntries(roleCounts.map((r) => [r._id, r.count])),
  });
});

// @route GET /api/users/meta/roles — role options for the forms
export const getRolesMeta = asyncHandler(async (req, res) => {
  res.json({ success: true, roles: ROLES.map((value) => ({ value, label: ROLE_LABELS[value] })) });
});

// @route GET /api/users/:id  (users cap)
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(ADMIN_USER_FIELDS);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  res.json({ success: true, user });
});

// @route POST /api/users  (users cap) — create a user
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'subscriber', phone, avatar, isActive } = req.body;
  let { username } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required.');
  }
  if (!ROLES.includes(role)) {
    res.status(400);
    throw new Error('Invalid role.');
  }
  if (!canAssignRole(req.user.role, role)) {
    res.status(403);
    throw new Error('Only a Super Admin can assign the Super Admin role.');
  }
  if (await User.findOne({ email: email.toLowerCase() })) {
    res.status(409);
    throw new Error('A user with this email already exists.');
  }
  if (username) {
    username = username.toLowerCase().trim();
    if (await User.exists({ username })) {
      res.status(409);
      throw new Error('That username is already taken.');
    }
  } else {
    username = await User.generateUsername(email.split('@')[0]);
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    username,
    phone,
    avatar,
    isActive: isActive === undefined ? true : !!isActive,
  });
  const safe = await User.findById(user._id).select(ADMIN_USER_FIELDS);
  res.status(201).json({ success: true, user: safe });
});

// @route PUT /api/users/:id  (users cap) — edit any field
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('+password');
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  const isSelf = user._id.toString() === req.user._id.toString();

  // Only a Super Admin may edit another Super Admin.
  if (user.role === 'super_admin' && req.user.role !== 'super_admin' && !isSelf) {
    res.status(403);
    throw new Error('Only a Super Admin can edit a Super Admin.');
  }

  const { name, phone, avatar, email, username, role, isActive, password } = req.body;

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;

  if (email !== undefined && email.toLowerCase() !== user.email) {
    if (await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } })) {
      res.status(409);
      throw new Error('A user with this email already exists.');
    }
    user.email = email.toLowerCase();
  }

  if (username !== undefined) {
    const uname = (username || '').toLowerCase().trim();
    if (uname && uname !== user.username && (await User.findOne({ username: uname, _id: { $ne: user._id } }))) {
      res.status(409);
      throw new Error('That username is already taken.');
    }
    user.username = uname || undefined;
  }

  if (role !== undefined && role !== user.role) {
    if (!ROLES.includes(role)) {
      res.status(400);
      throw new Error('Invalid role.');
    }
    if (isSelf) {
      res.status(400);
      throw new Error('You cannot change your own role.');
    }
    if (!canAssignRole(req.user.role, role)) {
      res.status(403);
      throw new Error('Only a Super Admin can assign the Super Admin role.');
    }
    user.role = role;
  }

  if (isActive !== undefined) {
    if (isSelf && !isActive) {
      res.status(400);
      throw new Error('You cannot deactivate your own account.');
    }
    user.isActive = !!isActive;
  }

  if (password) user.password = password; // re-hashed by the model pre-save hook

  await user.save();
  const safe = await User.findById(user._id).select(ADMIN_USER_FIELDS);
  res.json({ success: true, user: safe });
});

// @route DELETE /api/users/:id  (users cap)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account.');
  }
  if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
    res.status(403);
    throw new Error('Only a Super Admin can delete a Super Admin.');
  }
  await user.deleteOne();
  res.json({ success: true, message: 'User removed.' });
});

// @route POST /api/users/bulk-delete  { ids: [] }  (users cap)
export const bulkDeleteUsers = asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  if (!ids.length) {
    res.status(400);
    throw new Error('No users selected.');
  }
  const selfId = req.user._id.toString();
  const targets = await User.find({ _id: { $in: ids } }).select('_id role');
  const deletable = targets.filter(
    (u) => u._id.toString() !== selfId && !(u.role === 'super_admin' && req.user.role !== 'super_admin')
  );
  await User.deleteMany({ _id: { $in: deletable.map((u) => u._id) } });
  res.json({ success: true, deleted: deletable.length });
});
