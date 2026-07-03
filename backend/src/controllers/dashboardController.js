import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Enquiry from '../models/Enquiry.js';

// @route GET /api/dashboard/stats  (admin)
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalOrders,
    totalProducts,
    totalCustomers,
    pendingReviews,
    revenueAgg,
    statusCounts,
    recentOrders,
    lowStock,
    topProducts,
    newEnquiries,
  ] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Review.countDocuments({ isApproved: false }),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.find().populate('user', 'name email').sort('-createdAt').limit(8),
    Product.find({ $expr: { $lte: ['$stock', '$lowStockThreshold'] } })
      .select('name sku stock lowStockThreshold')
      .limit(10),
    Product.find().sort('-soldCount').limit(5).select('name soldCount price images'),
    Enquiry.countDocuments({ status: 'new' }),
  ]);

  // Last 30 days revenue series.
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const salesSeries = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalProducts,
      totalCustomers,
      pendingReviews,
      newEnquiries,
      totalRevenue: revenueAgg[0]?.total || 0,
      ordersByStatus: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
      recentOrders,
      lowStock,
      topProducts,
      salesSeries,
    },
  });
});
