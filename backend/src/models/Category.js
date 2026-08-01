import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: String,
    image: String,
    icon: String,
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    // Which taxonomy this belongs to: 'menu' = top navigation menu,
    // 'shop' = home-page "Shop by Category".
    group: { type: String, enum: ['menu', 'shop'], default: 'shop', index: true },
    order: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true }
);

categorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
