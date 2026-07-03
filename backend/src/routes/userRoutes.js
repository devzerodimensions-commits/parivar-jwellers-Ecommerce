import { Router } from 'express';
import { protect, requireCap } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  updateProfile,
  updatePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  getRolesMeta,
} from '../controllers/userController.js';
import { uploadImage } from '../controllers/uploadController.js';

const router = Router();

// All routes require authentication.
router.use(protect);

// ---- Self-service (any logged-in user) ----
router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.post('/avatar', upload.single('image'), uploadImage); // own profile photo

router.route('/addresses').get(getAddresses).post(addAddress);
router.route('/addresses/:addressId').put(updateAddress).delete(deleteAddress);

router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', toggleWishlist);

// ---- Admin user management (requires the "users" capability) ----
router.get('/meta/roles', requireCap('users'), getRolesMeta);
router.post('/bulk-delete', requireCap('users'), bulkDeleteUsers);
router.route('/').get(requireCap('users'), getUsers).post(requireCap('users'), createUser);
router
  .route('/:id')
  .get(requireCap('users'), getUser)
  .put(requireCap('users'), updateUser)
  .delete(requireCap('users'), deleteUser);

export default router;
