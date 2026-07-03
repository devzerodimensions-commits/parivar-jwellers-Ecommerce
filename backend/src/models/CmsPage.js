import mongoose from 'mongoose';
import slugify from 'slugify';

// CMS-managed static pages: About, Contact, FAQ, Privacy Policy, Terms, etc.
const cmsPageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    content: { type: String, default: '' }, // HTML
    type: { type: String, enum: ['page', 'faq', 'policy'], default: 'page' },
    // For FAQ pages, an optional structured Q&A list.
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
    isPublished: { type: Boolean, default: true },
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true }
);

cmsPageSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const CmsPage = mongoose.model('CmsPage', cmsPageSchema);
export default CmsPage;
