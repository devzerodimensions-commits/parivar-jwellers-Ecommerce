import mongoose from 'mongoose';

// A product/price enquiry submitted by a visitor (used in "enquiry mode").
const enquirySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    productSlug: String,
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: { type: String, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

const Enquiry = mongoose.model('Enquiry', enquirySchema);
export default Enquiry;
