import asyncHandler from '../middleware/asyncHandler.js';
import Subscriber from '../models/Subscriber.js';

// @route POST /api/subscribers  (public)
export const subscribe = asyncHandler(async (req, res) => {
  const email = (req.body.email || '').toLowerCase().trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email.');
  }
  const existing = await Subscriber.findOne({ email });
  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true;
      await existing.save();
    }
    return res.json({ success: true, message: 'You are already subscribed.' });
  }
  await Subscriber.create({ email, source: req.body.source });
  res.status(201).json({ success: true, message: 'Thanks for subscribing!' });
});

// ---------- Admin ----------

// @route GET /api/subscribers  (admin)
export const getSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Subscriber.find().sort('-createdAt');
  res.json({ success: true, count: subscribers.length, subscribers });
});

// @route DELETE /api/subscribers/:id  (admin)
export const deleteSubscriber = asyncHandler(async (req, res) => {
  const sub = await Subscriber.findByIdAndDelete(req.params.id);
  if (!sub) {
    res.status(404);
    throw new Error('Subscriber not found.');
  }
  res.json({ success: true, message: 'Subscriber removed.' });
});
