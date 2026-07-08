import mongoose from 'mongoose';

// Single-document store for global website settings managed from the admin panel.
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true }, // singleton guard
    siteName: { type: String, default: 'Parivar Jewellers' },
    tagline: { type: String, default: 'Parivar Jewellers - Gold, Silver, Diamond Jewellery Store in Mehsana' },
    logo: String,
    favicon: String,

    theme: {
      primaryColor: { type: String, default: '#C8A04B' }, // gold
      secondaryColor: { type: String, default: '#1A1A1A' }, // near-black
    },

    contact: {
      email: { type: String, default: 'support@jewelly.com' },
      phone: { type: String, default: '+91 82829 69651' },
      whatsapp: String,
      address: { type: String, default: 'Mumbai, Maharashtra, India' },
    },

    social: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
    },

    smtp: {
      host: String,
      port: Number,
      user: String,
      pass: String,
      from: String,
    },

    currency: {
      code: { type: String, default: 'INR' },
      symbol: { type: String, default: '₹' },
    },

    // Enquiry mode: hide prices across the store and show an "Enquiry" button
    // on product pages instead of Add to Cart.
    enquiryMode: { type: Boolean, default: false },

    shipping: {
      freeShippingThreshold: { type: Number, default: 5000 },
      flatRate: { type: Number, default: 99 },
    },

    tax: {
      rate: { type: Number, default: 3 }, // GST % on jewellery
      inclusive: { type: Boolean, default: false },
    },

    seo: {
      metaTitle: { type: String, default: 'Parivar Jewellers — Fine Gold & Diamond Jewellery' },
      metaDescription: {
        type: String,
        default: 'Shop BIS hallmarked gold, certified diamond and sterling silver jewellery online.',
      },
      ogImage: String,
    },

    footer: {
      aboutText: {
        type: String,
        default: 'Parivar Jewellers - Gold, Silver, Diamond Jewellery Store in Mehsana',
      },
      copyright: { type: String, default: '© Parivar Jewellers. All rights reserved.' },
    },

    announcements: [String],
  },
  { timestamps: true }
);

// Convenience accessor that always returns the single settings doc, creating it if missing.
settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ key: 'global' });
  if (!doc) doc = await this.create({ key: 'global' });
  return doc;
};

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
