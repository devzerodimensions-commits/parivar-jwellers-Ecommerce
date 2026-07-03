import asyncHandler from '../middleware/asyncHandler.js';
import Enquiry from '../models/Enquiry.js';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
import sendEmail from '../utils/sendEmail.js';

// @route POST /api/enquiries  (public) — submit a product enquiry
export const createEnquiry = asyncHandler(async (req, res) => {
  const { product: productId, name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Name, email and message are required.');
  }

  let productName, productSlug;
  if (productId) {
    const product = await Product.findById(productId).select('name slug');
    if (product) {
      productName = product.name;
      productSlug = product.slug;
    }
  }

  const enquiry = await Enquiry.create({
    product: productId || undefined,
    productName,
    productSlug,
    name,
    email,
    phone,
    message,
  });

  // Notify the store (logs to console if SMTP isn't configured).
  try {
    const settings = await Settings.getSingleton();
    const to = settings.contact?.email;
    if (to) {
      await sendEmail({
        to,
        subject: `New enquiry${productName ? ` — ${productName}` : ''}`,
        text: `From: ${name} <${email}> ${phone || ''}\nProduct: ${productName || '—'}\n\n${message}`,
        html: `<p><strong>${name}</strong> &lt;${email}&gt; ${phone || ''}</p>
          <p>Product: ${productName || '—'}</p>
          <p>${message}</p>`,
      });
    }
  } catch {
    /* email failure shouldn't block the enquiry */
  }

  res.status(201).json({ success: true, message: 'Thanks! Your enquiry has been sent.', enquiry });
});

// ---------- Admin ----------

// @route GET /api/enquiries  (admin)
export const getEnquiries = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const enquiries = await Enquiry.find(filter).sort('-createdAt');
  res.json({ success: true, count: enquiries.length, enquiries });
});

// @route PUT /api/enquiries/:id  (admin) — update status
export const updateEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found.');
  }
  if (req.body.status) enquiry.status = req.body.status;
  await enquiry.save();
  res.json({ success: true, enquiry });
});

// @route DELETE /api/enquiries/:id  (admin)
export const deleteEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found.');
  }
  res.json({ success: true, message: 'Enquiry deleted.' });
});
