import asyncHandler from '../middleware/asyncHandler.js';
import Order, { ORDER_STATUSES } from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Settings from '../models/Settings.js';

/**
 * Re-price the cart on the server. Never trust client-sent prices.
 * Returns { items, itemsPrice } or throws on stock/availability errors.
 */
const priceCart = async (cartItems) => {
  if (!cartItems?.length) {
    const err = new Error('Your cart is empty.');
    err.statusCode = 400;
    throw err;
  }

  const items = [];
  let itemsPrice = 0;

  for (const ci of cartItems) {
    const product = await Product.findById(ci.product);
    if (!product || !product.isActive) {
      const err = new Error(`A product in your cart is no longer available.`);
      err.statusCode = 400;
      throw err;
    }
    const qty = Math.max(1, Number(ci.quantity) || 1);
    if (product.stock < qty) {
      const err = new Error(`Only ${product.stock} left in stock for "${product.name}".`);
      err.statusCode = 400;
      throw err;
    }
    const price = product.effectivePrice;
    itemsPrice += price * qty;
    items.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url,
      sku: product.sku,
      variant: ci.variant || '',
      price,
      quantity: qty,
    });
  }

  return { items, itemsPrice: Math.round(itemsPrice * 100) / 100 };
};

// @route POST /api/orders
export const createOrder = asyncHandler(async (req, res) => {
  const { items: cartItems, shippingAddress, billingAddress, paymentMethod, couponCode, notes } = req.body;

  const { items, itemsPrice } = await priceCart(cartItems);
  const settings = await Settings.getSingleton();

  // Shipping
  const shippingPrice =
    itemsPrice >= settings.shipping.freeShippingThreshold ? 0 : settings.shipping.flatRate;

  // Coupon
  let discount = 0;
  let appliedCode;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) {
      res.status(400);
      throw new Error('Invalid coupon code.');
    }
    const result = coupon.evaluate(itemsPrice);
    if (!result.valid) {
      res.status(400);
      throw new Error(result.message);
    }
    discount = result.discount;
    appliedCode = coupon.code;
    coupon.usedCount += 1;
    await coupon.save();
  }

  // Tax (on discounted subtotal)
  const taxable = Math.max(0, itemsPrice - discount);
  const taxPrice = Math.round(((taxable * settings.tax.rate) / 100) * 100) / 100;

  const totalPrice = Math.round((taxable + taxPrice + shippingPrice) * 100) / 100;

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    paymentMethod: paymentMethod || 'COD',
    itemsPrice,
    taxPrice,
    shippingPrice,
    discount,
    couponCode: appliedCode,
    totalPrice,
    notes,
  });

  // Decrement stock & bump soldCount.
  await Promise.all(
    items.map((it) =>
      Product.updateOne(
        { _id: it.product },
        { $inc: { stock: -it.quantity, soldCount: it.quantity } }
      )
    )
  );

  res.status(201).json({ success: true, order });
});

// @route GET /api/orders/mine
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ success: true, count: orders.length, orders });
});

// @route GET /api/orders/:id  (owner or admin)
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found.');
  }
  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order.');
  }
  res.json({ success: true, order });
});

// @route GET /api/orders/track/:orderNumber  — public order tracking by number + email
export const trackOrder = asyncHandler(async (req, res) => {
  const { email } = req.query;
  const order = await Order.findOne({ orderNumber: req.params.orderNumber }).populate('user', 'email');
  if (!order || (email && order.user?.email?.toLowerCase() !== email.toLowerCase())) {
    res.status(404);
    throw new Error('Order not found. Check the order number and email.');
  }
  res.json({
    success: true,
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      statusHistory: order.statusHistory,
      trackingNumber: order.trackingNumber,
      courier: order.courier,
      isDelivered: order.isDelivered,
      createdAt: order.createdAt,
      items: order.items,
      totalPrice: order.totalPrice,
    },
  });
});

// @route PUT /api/orders/:id/cancel  (owner)
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found.');
  }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized.');
  }
  if (!['pending', 'processing'].includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot cancel an order that is already ${order.status}.`);
  }
  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by customer', at: new Date() });
  await order.save();

  // Restock.
  await Promise.all(
    order.items.map((it) =>
      Product.updateOne({ _id: it.product }, { $inc: { stock: it.quantity, soldCount: -it.quantity } })
    )
  );

  res.json({ success: true, order });
});

// ---------- Admin ----------

// @route GET /api/orders  (admin)
export const getOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
  const filter = {};
  if (req.query.status && ORDER_STATUSES.includes(req.query.status)) filter.status = req.query.status;
  if (req.query.search) filter.orderNumber = { $regex: req.query.search, $options: 'i' };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, total, page, pages: Math.ceil(total / limit), orders });
});

// @route PUT /api/orders/:id/status  (admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingNumber, courier } = req.body;
  if (!ORDER_STATUSES.includes(status)) {
    res.status(400);
    throw new Error('Invalid status.');
  }
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found.');
  }
  order.status = status;
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  if (courier !== undefined) order.courier = courier;
  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'COD') {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentStatus = 'paid';
    }
  }
  order.statusHistory.push({ status, note: note || `Marked ${status}`, at: new Date() });
  await order.save();
  res.json({ success: true, order });
});

// @route PUT /api/orders/:id/pay  (admin) — mark as paid
export const markOrderPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found.');
  }
  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentStatus = 'paid';
  order.paymentResult = req.body.paymentResult || { id: 'manual', status: 'paid' };
  await order.save();
  res.json({ success: true, order });
});
