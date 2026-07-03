import asyncHandler from '../middleware/asyncHandler.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';

// @route GET /api/products/:productId/reviews
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true })
    .populate('user', 'name avatar')
    .sort('-createdAt');
  res.json({ success: true, count: reviews.length, reviews });
});

// @route POST /api/products/:productId/reviews  (auth)
export const createReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const productId = req.params.productId;

  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) {
    res.status(409);
    throw new Error('You have already reviewed this product.');
  }

  // Verified purchase if the user has a delivered order containing this product.
  const purchased = await Order.exists({
    user: req.user._id,
    'items.product': productId,
    status: 'delivered',
  });

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    name: req.user.name,
    rating,
    title,
    comment,
    isVerifiedPurchase: !!purchased,
  });

  res.status(201).json({ success: true, review });
});

// @route PUT /api/reviews/:id  (owner)
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found.');
  }
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized.');
  }
  const { rating, title, comment } = req.body;
  if (rating !== undefined) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;
  await review.save();
  res.json({ success: true, review });
});

// @route DELETE /api/reviews/:id  (owner or admin)
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found.');
  }
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized.');
  }
  await Review.findOneAndDelete({ _id: review._id });
  res.json({ success: true, message: 'Review removed.' });
});

// ---------- Admin ----------

// @route GET /api/reviews  (admin)
export const getReviews = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.approved === 'false') filter.isApproved = false;
  const reviews = await Review.find(filter)
    .populate('user', 'name email')
    .populate('product', 'name slug')
    .sort('-createdAt');
  res.json({ success: true, count: reviews.length, reviews });
});

// @route PUT /api/reviews/:id/approve  (admin)
export const setReviewApproval = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found.');
  }
  review.isApproved = req.body.isApproved !== false;
  await review.save();
  await Review.recalcRating(review.product);
  res.json({ success: true, review });
});
