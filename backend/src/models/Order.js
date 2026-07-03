import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: String,
    sku: String,
    variant: String, // human-readable, e.g. "Size: 14"
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'India' },
  },
  { _id: false }
);

export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: [orderItemSchema],

    shippingAddress: addressSchema,
    billingAddress: addressSchema,

    paymentMethod: { type: String, enum: ['COD', 'Card', 'UPI', 'NetBanking'], default: 'COD' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paymentResult: {
      id: String,
      status: String,
      updateTime: String,
    },

    itemsPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: String,
    totalPrice: { type: Number, required: true, default: 0 },

    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        note: String,
        at: { type: Date, default: Date.now },
      },
    ],

    trackingNumber: String,
    courier: String,

    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,

    notes: String,
  },
  { timestamps: true }
);

// Generate a human-friendly order number before first save.
orderSchema.pre('save', async function (next) {
  if (this.orderNumber) return next();
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(
    date.getDate()
  ).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  this.orderNumber = `JW-${ymd}-${rand}`;
  if (!this.statusHistory || this.statusHistory.length === 0) {
    this.statusHistory = [{ status: this.status, note: 'Order placed', at: new Date() }];
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
