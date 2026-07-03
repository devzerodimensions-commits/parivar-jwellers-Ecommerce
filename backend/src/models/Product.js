import mongoose from 'mongoose';
import slugify from 'slugify';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: String,
  },
  { _id: false }
);

// Flexible attribute pair, e.g. { key: 'Purity', value: '22K BIS 916' }
const attributeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

// A variant group (e.g. "Size") with selectable options.
const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Ring Size", "Metal"
    options: [
      {
        label: { type: String, required: true }, // e.g. "14", "Yellow Gold"
        sku: String,
        priceModifier: { type: Number, default: 0 }, // +/- on base price
        stock: { type: Number, default: 0 },
      },
    ],
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    // SKU is optional. unique + sparse lets multiple products have no SKU.
    sku: { type: String, unique: true, sparse: true, uppercase: true, trim: true },

    shortDescription: String,
    description: { type: String, default: '' },

    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0, default: null },
    costPrice: { type: Number, min: 0 },

    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    tags: [String],

    images: [imageSchema],

    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },

    attributes: [attributeSchema],
    variants: [variantSchema],

    // ---- Jewelry-specific facets ----
    material: { type: String, enum: ['Gold', 'Diamond', 'Silver', 'Platinum', 'Gemstone', 'Other'], default: 'Gold' },
    purity: String, // 22K, 18K, 916 Hallmark, 925 Sterling
    grossWeight: Number, // grams
    netWeight: Number, // grams
    gender: { type: String, enum: ['Women', 'Men', 'Unisex', 'Kids'], default: 'Women' },
    occasion: [String], // Wedding, Daily, Party, Festive

    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },

    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // ---- SEO ----
    metaTitle: String,
    metaDescription: String,
    ogImage: String,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Text index for search across name / description / tags / sku.
productSchema.index({ name: 'text', description: 'text', tags: 'text', sku: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });

// Effective price (sale if set & lower, else price).
productSchema.virtual('effectivePrice').get(function () {
  if (this.salePrice != null && this.salePrice > 0 && this.salePrice < this.price) {
    return this.salePrice;
  }
  return this.price;
});

productSchema.virtual('onSale').get(function () {
  return this.salePrice != null && this.salePrice > 0 && this.salePrice < this.price;
});

productSchema.virtual('discountPercent').get(function () {
  if (this.salePrice != null && this.salePrice > 0 && this.salePrice < this.price) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

productSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  // Treat a blank SKU as "no SKU" so the sparse unique index ignores it.
  if (!this.sku) this.sku = undefined;
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
