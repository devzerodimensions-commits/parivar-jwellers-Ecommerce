/**
 * Seed the database with a realistic jewelry catalog, an admin user,
 * store settings, banners, coupons, blog posts and CMS pages.
 *
 *   npm run seed           # wipe + insert demo data
 *   npm run seed:destroy   # wipe everything
 *
 * Product/banner images are generated locally as branded SVGs under
 * uploads/seed and served by the API at /uploads/seed/*.
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db.js';

import User from '../models/User.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Banner from '../models/Banner.js';
import Blog from '../models/Blog.js';
import CmsPage from '../models/CmsPage.js';
import Settings from '../models/Settings.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Subscriber from '../models/Subscriber.js';

import { productImage, bannerImage, categoryImage } from './seedImages.js';

const wipe = async () => {
  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    Brand.deleteMany(),
    Product.deleteMany(),
    Coupon.deleteMany(),
    Banner.deleteMany(),
    Blog.deleteMany(),
    CmsPage.deleteMany(),
    Settings.deleteMany(),
    Order.deleteMany(),
    Review.deleteMany(),
    Subscriber.deleteMany(),
  ]);
};

const seed = async () => {
  await wipe();

  // ---- Categories ----
  const categoryData = [
    { name: 'Gold Jewellery', glyph: 'necklace', material: 'gold', isFeatured: true, order: 1, description: 'BIS 916 hallmarked 22K & 18K gold jewellery — necklaces, bangles, chains and more.' },
    { name: 'Diamond Jewellery', glyph: 'diamond', material: 'diamond', isFeatured: true, order: 2, description: 'IGI/SGL certified natural diamond rings, earrings and pendants.' },
    { name: 'Silver Jewellery', glyph: 'bangle', material: 'silver', isFeatured: true, order: 3, description: '925 sterling and 999 fine silver anklets, earrings and gifts.' },
    { name: 'Gold Coins', glyph: 'coin', material: 'gold-coins', isFeatured: true, order: 4, description: '24K 999.9 purity gold coins — a timeless investment and gift.' },
    { name: 'Bridal & Wedding', glyph: 'necklace', material: 'bridal', isFeatured: true, order: 5, description: 'Polki, kundan and temple bridal sets for the big day.' },
    { name: 'Gifts', glyph: 'earring', material: 'gifts', isFeatured: true, order: 6, description: 'Thoughtfully crafted gifts for every occasion and budget.' },
  ];
  const categories = {};
  for (const c of categoryData) {
    const doc = await Category.create({
      name: c.name,
      description: c.description,
      image: categoryImage(c.name, c.glyph, c.material),
      isFeatured: c.isFeatured,
      order: c.order,
      metaTitle: `${c.name} | Jewelly`,
      metaDescription: c.description,
    });
    categories[c.name] = doc;
  }

  // ---- Brands / collections ----
  const brandData = [
    { name: 'Aurelia', description: 'Everyday-luxury gold for the modern woman.' },
    { name: 'Solitaire Studio', description: 'Certified diamonds, expertly set.' },
    { name: 'Heritage Gold', description: 'Temple and antique-inspired craftsmanship.' },
    { name: 'Silver Lune', description: 'Contemporary sterling silver.' },
  ];
  const brands = {};
  for (const b of brandData) {
    brands[b.name] = await Brand.create({ ...b, isFeatured: true });
  }

  // ---- Products ----
  const P = (o) => ({
    stock: 12,
    lowStockThreshold: 3,
    isActive: true,
    occasion: ['Daily'],
    ...o,
  });

  const productData = [
    P({ name: 'Aanya 22K Gold Jhumka Earrings', sku: 'JW-GE-1001', category: 'Gold Jewellery', brand: 'Heritage Gold', material: 'Gold', purity: '22K BIS 916', grossWeight: 8.4, netWeight: 8.1, gender: 'Women', price: 62000, salePrice: 58500, glyph: 'earring', tags: ['earrings', 'jhumka', 'traditional', 'festive'], occasion: ['Festive', 'Wedding'], isFeatured: true, isBestSeller: true, shortDescription: 'Handcrafted temple jhumkas in 22K hallmarked gold.', description: 'Intricately handcrafted jhumka earrings in 22K BIS 916 hallmarked gold, finished with traditional temple motifs and a satin-matte sheen. Secure push-back closure for all-day comfort.' }),
    P({ name: 'Meera Gold Temple Necklace Set', sku: 'JW-GN-1002', category: 'Gold Jewellery', brand: 'Heritage Gold', material: 'Gold', purity: '22K BIS 916', grossWeight: 32.5, gender: 'Women', price: 245000, salePrice: 229000, stock: 5, glyph: 'necklace', tags: ['necklace', 'temple', 'bridal'], occasion: ['Wedding', 'Festive'], isFeatured: true, shortDescription: 'Temple-style necklace with matching earrings.', description: 'A regal 22K gold temple necklace set featuring repoussé goddess motifs and a pair of coordinating earrings. A statement heirloom for weddings and festive occasions.' }),
    P({ name: 'Solitaire Radiance Diamond Ring', sku: 'JW-DR-1003', category: 'Diamond Jewellery', brand: 'Solitaire Studio', material: 'Diamond', purity: '18K Gold', grossWeight: 3.2, gender: 'Women', price: 98000, salePrice: 89000, glyph: 'ring', tags: ['ring', 'solitaire', 'engagement', 'diamond'], occasion: ['Engagement'], isFeatured: true, isBestSeller: true, shortDescription: '0.50ct IGI-certified solitaire in 18K gold.', description: 'A brilliant-cut 0.50ct natural solitaire (IGI certified, VS clarity, F colour) set in a six-prong 18K gold band. The timeless choice for your engagement.' }),
    P({ name: 'Riya Diamond Stud Earrings', sku: 'JW-DE-1004', category: 'Diamond Jewellery', brand: 'Solitaire Studio', material: 'Diamond', purity: '18K Gold', grossWeight: 2.1, gender: 'Women', price: 54000, glyph: 'earring', tags: ['earrings', 'studs', 'diamond', 'daily'], shortDescription: 'Classic diamond studs for everyday sparkle.', description: 'A pair of 0.30ct (total) round-brilliant diamond studs in four-prong 18K gold settings. SGL certified, with screw-back closures for security.' }),
    P({ name: "Anant Men's Gold Kada", sku: 'JW-GB-1005', category: 'Gold Jewellery', brand: 'Aurelia', material: 'Gold', purity: '22K BIS 916', grossWeight: 24.8, gender: 'Men', price: 182000, stock: 6, glyph: 'bangle', tags: ['kada', 'bracelet', 'men'], shortDescription: 'Bold textured kada in 22K gold.', description: 'A substantial 22K gold kada with a brushed-and-polished finish and a secure box clasp. Designed for the modern man who values understated strength.' }),
    P({ name: 'Tara Diamond Pendant', sku: 'JW-DP-1006', category: 'Diamond Jewellery', brand: 'Solitaire Studio', material: 'Diamond', purity: '18K Gold', grossWeight: 1.8, gender: 'Women', price: 41000, salePrice: 37500, glyph: 'necklace', tags: ['pendant', 'diamond'], shortDescription: 'Floral diamond pendant with chain.', description: 'A delicate floral-cluster diamond pendant (0.18ct total) in 18K gold, paired with an 18-inch cable chain. Perfect for layering or wearing solo.' }),
    P({ name: 'Lakshmi 24K Gold Coin — 10g', sku: 'JW-GC-1007', category: 'Gold Coins', material: 'Gold', purity: '24K 999.9', grossWeight: 10, gender: 'Unisex', price: 78500, stock: 40, glyph: 'coin', tags: ['coin', 'investment', 'gift'], occasion: ['Festive', 'Gift'], isBestSeller: true, shortDescription: '10g 999.9 purity gold coin in tamper-proof pack.', description: 'A 10-gram 24K (999.9 purity) gold coin embossed with Goddess Lakshmi, sealed in a tamper-evident assay-certified pack. A trusted gift and investment.' }),
    P({ name: 'Lakshmi 24K Gold Coin — 5g', sku: 'JW-GC-1008', category: 'Gold Coins', material: 'Gold', purity: '24K 999.9', grossWeight: 5, gender: 'Unisex', price: 39800, stock: 60, glyph: 'coin', tags: ['coin', 'investment', 'gift'], occasion: ['Festive', 'Gift'], shortDescription: '5g 999.9 purity gold coin.', description: 'A 5-gram 24K (999.9 purity) gold coin in a tamper-evident assay-certified pack — ideal for gifting on Dhanteras and weddings.' }),
    P({ name: 'Saanvi Polki Bridal Necklace', sku: 'JW-BR-1009', category: 'Bridal & Wedding', brand: 'Heritage Gold', material: 'Gold', purity: '22K BIS 916', grossWeight: 56, gender: 'Women', price: 420000, salePrice: 399000, stock: 3, glyph: 'necklace', tags: ['bridal', 'polki', 'kundan', 'wedding'], occasion: ['Wedding'], isFeatured: true, shortDescription: 'Uncut polki bridal necklace with pearls.', description: 'A grand bridal necklace set with uncut polki diamonds, kundan work and freshwater-pearl drops on a 22K gold base. The centrepiece your wedding deserves.' }),
    P({ name: "Kiaan Men's Diamond Ring", sku: 'JW-DR-1010', category: 'Diamond Jewellery', brand: 'Solitaire Studio', material: 'Diamond', purity: '18K Gold', grossWeight: 5.4, gender: 'Men', price: 76000, glyph: 'ring', tags: ['ring', 'men', 'diamond'], shortDescription: "Men's signet ring with pavé diamonds.", description: 'A confident signet-style ring in 18K gold, pavé-set with 0.25ct of natural diamonds across a black-rhodium centre. SGL certified.' }),
    P({ name: 'Ira Sterling Silver Anklet', sku: 'JW-SA-1011', category: 'Silver Jewellery', brand: 'Silver Lune', material: 'Silver', purity: '925 Sterling', grossWeight: 18, gender: 'Women', price: 4200, salePrice: 3600, stock: 25, glyph: 'bangle', tags: ['anklet', 'silver', 'payal'], shortDescription: 'Ghungroo anklet in 925 sterling silver.', description: 'A pair of 925 sterling silver anklets with tiny ghungroo bells and an adjustable chain. Anti-tarnish rhodium finish.' }),
    P({ name: 'Naina Silver Oxidised Earrings', sku: 'JW-SE-1012', category: 'Silver Jewellery', brand: 'Silver Lune', material: 'Silver', purity: '925 Sterling', grossWeight: 12, gender: 'Women', price: 2800, stock: 30, glyph: 'earring', tags: ['earrings', 'silver', 'oxidised', 'boho'], shortDescription: 'Oxidised silver chandbali earrings.', description: 'Handcrafted oxidised 925 silver chandbali earrings with filigree detailing — a boho-chic staple for kurtas and sarees alike.' }),
    P({ name: 'Aarav 22K Gold Chain', sku: 'JW-GC-1013', category: 'Gold Jewellery', brand: 'Aurelia', material: 'Gold', purity: '22K BIS 916', grossWeight: 14.6, gender: 'Men', price: 108000, glyph: 'chain', tags: ['chain', 'men', 'gold'], shortDescription: '20-inch rope chain in 22K gold.', description: 'A 20-inch 22K gold rope chain with a secure lobster clasp. Versatile enough for daily wear and substantial enough to make a statement.' }),
    P({ name: 'Diya Gold Mangalsutra', sku: 'JW-GM-1014', category: 'Gold Jewellery', brand: 'Aurelia', material: 'Gold', purity: '22K BIS 916', grossWeight: 11.2, gender: 'Women', price: 86000, salePrice: 82000, glyph: 'necklace', tags: ['mangalsutra', 'bridal', 'gold'], occasion: ['Wedding'], isBestSeller: true, shortDescription: 'Black-bead mangalsutra with diamond pendant.', description: 'A contemporary mangalsutra in 22K gold with twin black-bead strands and a diamond-accented pendant. Lightweight for everyday wear.' }),
    P({ name: 'Veda Diamond Bangle Pair', sku: 'JW-DB-1015', category: 'Diamond Jewellery', brand: 'Solitaire Studio', material: 'Diamond', purity: '18K Gold', grossWeight: 22, gender: 'Women', price: 215000, stock: 4, glyph: 'bangle', tags: ['bangles', 'diamond'], occasion: ['Wedding', 'Party'], isFeatured: true, shortDescription: 'Pair of pavé diamond bangles.', description: 'A matched pair of 18K gold bangles pavé-set with 1.8ct of natural diamonds. IGI certified, with a concealed clasp for a seamless look.' }),
    P({ name: 'Myra Rose Gold Bracelet', sku: 'JW-GB-1016', category: 'Gold Jewellery', brand: 'Aurelia', material: 'Gold', purity: '18K Rose Gold', grossWeight: 7.8, gender: 'Women', price: 58000, salePrice: 52000, glyph: 'bangle', tags: ['bracelet', 'rose-gold', 'daily'], shortDescription: 'Dainty rose-gold tennis bracelet.', description: 'A dainty 18K rose-gold bracelet with a line of bezel-set cubic stones and an adjustable slider clasp. Effortless everyday elegance.' }),
    P({ name: 'Aria Pearl Drop Earrings', sku: 'JW-GP-1017', category: 'Gifts', brand: 'Silver Lune', material: 'Other', purity: 'Pearl on 925 Silver', grossWeight: 6, gender: 'Women', price: 6500, stock: 20, glyph: 'earring', tags: ['pearl', 'earrings', 'gift'], occasion: ['Gift', 'Party'], shortDescription: 'Freshwater pearl drops on silver.', description: 'Lustrous freshwater-pearl drop earrings on 925 silver hooks with a rhodium finish. Presented in a gift box — a graceful present for any occasion.' }),
    P({ name: 'Krish Silver Gift Coin — Ganesh', sku: 'JW-SC-1018', category: 'Gifts', material: 'Silver', purity: '999 Fine Silver', grossWeight: 20, gender: 'Unisex', price: 3200, stock: 50, glyph: 'coin', tags: ['silver', 'coin', 'gift', 'pooja'], occasion: ['Gift', 'Festive'], shortDescription: '20g fine silver Ganesh coin.', description: 'A 20-gram 999 fine silver coin embossed with Lord Ganesh, in a tamper-evident pack. A meaningful gift for housewarmings and festivals.' }),
    P({ name: 'Anvi Gold Nose Pin', sku: 'JW-GN-1019', category: 'Gold Jewellery', brand: 'Aurelia', material: 'Gold', purity: '18K Gold', grossWeight: 1.1, gender: 'Women', price: 9800, stock: 35, glyph: 'ring', tags: ['nosepin', 'daily', 'gold'], shortDescription: 'Tiny CZ-studded gold nose pin.', description: 'A featherlight 18K gold nose pin with a single sparkling CZ and a comfortable screw fitting for all-day wear.' }),
    P({ name: 'Reyansh Platinum Band', sku: 'JW-PR-1020', category: 'Diamond Jewellery', brand: 'Solitaire Studio', material: 'Platinum', purity: 'PT950', grossWeight: 6.2, gender: 'Men', price: 64000, glyph: 'ring', tags: ['platinum', 'band', 'wedding', 'men'], occasion: ['Wedding'], isNewArrival: true, shortDescription: 'Brushed PT950 platinum wedding band.', description: 'A 6mm PT950 platinum wedding band with a brushed centre and polished bevelled edges. Hypoallergenic and built to last a lifetime.' }),
  ];

  // Mark the most recent few as new arrivals.
  for (const p of productData) {
    const cat = categories[p.category];
    const brand = p.brand ? brands[p.brand] : undefined;
    await Product.create({
      name: p.name,
      sku: p.sku,
      shortDescription: p.shortDescription,
      description: p.description,
      price: p.price,
      salePrice: p.salePrice ?? null,
      category: cat._id,
      brand: brand?._id,
      tags: p.tags,
      images: [
        { url: productImage(p.name, p.glyph, materialKey(p), p.purity), alt: p.name },
        { url: productImage(`${p.name} – view 2`, p.glyph, materialKey(p), p.material), alt: `${p.name} alternate view` },
      ],
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      material: p.material,
      purity: p.purity,
      grossWeight: p.grossWeight,
      netWeight: p.netWeight,
      gender: p.gender,
      occasion: p.occasion,
      attributes: [
        { key: 'Metal', value: p.material },
        { key: 'Purity', value: p.purity },
        { key: 'Gross Weight', value: `${p.grossWeight} g` },
        { key: 'Gender', value: p.gender },
        { key: 'Certification', value: p.material === 'Diamond' ? 'IGI / SGL Certified' : 'BIS Hallmarked' },
      ],
      isFeatured: !!p.isFeatured,
      isNewArrival: !!p.isNewArrival,
      isBestSeller: !!p.isBestSeller,
      soldCount: p.isBestSeller ? 40 + Math.round(p.price % 30) : Math.round(p.price % 12),
      ratingAverage: 4 + ((p.price % 10) / 10) * 0.9,
      ratingCount: 3 + (p.price % 17),
      metaTitle: `${p.name} | Jewelly`,
      metaDescription: p.shortDescription,
    });
  }

  // ---- Staff (roles) + demo customer ----
  const admin = await User.create({
    name: process.env.ADMIN_NAME || 'Store Admin',
    email: process.env.ADMIN_EMAIL || 'admin@jewelly.com',
    username: 'admin',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    role: 'super_admin',
    phone: '+91 90000 00001',
  });
  // Sample staff to showcase the role system.
  await User.create([
    { name: 'Priya Nair', email: 'manager@jewelly.com', username: 'priya', password: 'Password@123', role: 'administrator', phone: '+91 90000 00010' },
    { name: 'Rahul Verma', email: 'editor@jewelly.com', username: 'rahul', password: 'Password@123', role: 'editor', phone: '+91 90000 00011' },
    { name: 'Sara Ali', email: 'author@jewelly.com', username: 'sara', password: 'Password@123', role: 'author', phone: '+91 90000 00012' },
  ]);
  await User.create({
    name: 'Aisha Khan',
    email: 'customer@jewelly.com',
    username: 'aisha',
    password: 'Customer@123',
    role: 'subscriber',
    phone: '+91 90000 00002',
    addresses: [
      {
        label: 'Home',
        fullName: 'Aisha Khan',
        phone: '+91 90000 00002',
        line1: '12 Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400020',
        country: 'India',
        isDefault: true,
      },
    ],
  });

  // ---- Coupons ----
  await Coupon.create([
    { code: 'WELCOME10', description: '10% off your first order (up to ₹5,000)', type: 'percentage', value: 10, minPurchase: 5000, maxDiscount: 5000, isActive: true },
    { code: 'FLAT2000', description: '₹2,000 off orders above ₹50,000', type: 'fixed', value: 2000, minPurchase: 50000, isActive: true },
    { code: 'DIWALI15', description: 'Festive 15% off (up to ₹15,000)', type: 'percentage', value: 15, minPurchase: 20000, maxDiscount: 15000, isActive: true },
  ]);

  // ---- Banners ----
  await Banner.create([
    { title: 'The Bridal Edit', subtitle: 'Wedding Collection', image: bannerImage('The Bridal Edit', 'Wedding Collection', 'bridal', 'banner-bridal.svg'), link: '/category/bridal-wedding', buttonText: 'Shop Bridal', position: 'hero', order: 1, isActive: true },
    { title: 'Certified Diamonds', subtitle: 'Brilliance, Guaranteed', image: bannerImage('Certified Diamonds', 'Brilliance Guaranteed', 'diamond', 'banner-diamond.svg'), link: '/category/diamond-jewellery', buttonText: 'Explore Diamonds', position: 'hero', order: 2, isActive: true },
    { title: '24K Gold Coins', subtitle: 'Gift & Invest', image: bannerImage('24K Gold Coins', 'Gift & Invest', 'gold-coins', 'banner-coins.svg'), link: '/category/gold-coins', buttonText: 'Buy Coins', position: 'hero', order: 3, isActive: true },
    { title: 'Festive Offer — 15% Off', subtitle: 'Use code DIWALI15', image: bannerImage('Festive 15% Off', 'Use code DIWALI15', 'gold', 'banner-promo.svg'), link: '/shop?onSale=true', buttonText: 'Shop the Sale', position: 'promo', order: 1, isActive: true },
  ]);

  // ---- Blog posts ----
  await Blog.create([
    {
      title: 'How to Choose the Perfect Engagement Ring',
      excerpt: 'The 4Cs, metal choices and ring sizing — a practical guide to picking a solitaire she will treasure.',
      content: '<p>Choosing an engagement ring comes down to understanding the 4Cs — cut, colour, clarity and carat. <strong>Cut</strong> has the biggest impact on sparkle, so prioritise it. For colour, the G–H range offers a near-colourless look at better value. VS1–VS2 clarity is eye-clean, and carat is a matter of budget and preference.</p><p>For the band, 18K gold balances purity and durability, while platinum (PT950) is hypoallergenic and naturally white. Always ask for an IGI or SGL certificate, and measure ring size in the evening when fingers are largest.</p>',
      coverImage: bannerImage('Engagement Rings', 'Buying Guide', 'diamond', 'blog-rings.svg'),
      author: 'Jewelly Editorial',
      category: 'Buying Guide',
      tags: ['diamonds', 'rings', 'engagement'],
    },
    {
      title: 'Caring for Your Gold Jewellery at Home',
      excerpt: 'Simple, safe ways to keep 22K and 18K gold looking new — plus what to avoid.',
      content: '<p>Gold is durable but not indestructible. Remove jewellery before swimming, applying perfume or cleaning with chemicals. To clean at home, soak pieces in warm water with a drop of mild dish soap, brush gently with a soft toothbrush, rinse and pat dry.</p><p>Store pieces separately in soft pouches to prevent scratching, and bring intricate or stone-set jewellery to us once a year for professional cleaning and a prong check.</p>',
      coverImage: bannerImage('Gold Care', 'Care Tips', 'gold', 'blog-care.svg'),
      author: 'Jewelly Editorial',
      category: 'Care',
      tags: ['gold', 'care', 'tips'],
    },
    {
      title: 'Why BIS Hallmarking Matters',
      excerpt: 'What the six-digit HUID means and how it protects you as a buyer.',
      content: '<p>BIS hallmarking certifies the purity of gold. Since the introduction of the six-digit alphanumeric HUID (Hallmark Unique Identification), every hallmarked item carries the BIS logo, the purity grade (e.g. 22K916) and a unique HUID you can verify in the BIS Care app.</p><p>At Jewelly, every gold piece is BIS hallmarked, and every diamond is independently certified — so you always know exactly what you are buying.</p>',
      coverImage: bannerImage('BIS Hallmark', 'Trust & Transparency', 'gold-coins', 'blog-hallmark.svg'),
      author: 'Jewelly Editorial',
      category: 'Trust',
      tags: ['hallmark', 'gold', 'trust'],
    },
  ]);

  // ---- CMS pages ----
  await CmsPage.create([
    {
      title: 'About Us',
      type: 'page',
      content: '<p>Jewelly crafts BIS-hallmarked gold, certified diamond and sterling silver jewellery with complete transparency. From everyday elegance to once-in-a-lifetime bridal sets, every piece is made to be treasured — and backed by lifetime maintenance and buy-back assurance.</p><p>We believe fine jewellery should be honest: transparent pricing, certified purity and craftsmanship you can see. That promise is at the heart of everything we make.</p>',
      metaTitle: 'About Jewelly',
      metaDescription: 'Learn about Jewelly — BIS-hallmarked gold, certified diamonds and lifetime maintenance.',
    },
    {
      title: 'Contact',
      type: 'page',
      content: '<p>We would love to help. Reach us at <strong>support@jewelly.com</strong> or <strong>+91 82829 69651</strong>, Mon–Sat, 10am–7pm IST.</p><p>Visit our store: <strong>G-58, Silicon Skyland, Opp Kashi Vishvanath Mahadev Mandir, Radhanpur Road, Gujarat 384002</strong>.</p>',
      metaTitle: 'Contact Jewelly',
      metaDescription: 'Get in touch with the Jewelly team.',
    },
    {
      title: 'FAQ',
      type: 'faq',
      faqs: [
        { question: 'Is your gold BIS hallmarked?', answer: 'Yes. Every gold piece is BIS hallmarked with a unique HUID you can verify in the BIS Care app.' },
        { question: 'Are diamonds certified?', answer: 'All natural diamonds come with an IGI or SGL certificate detailing the 4Cs.' },
        { question: 'Do you offer returns?', answer: 'Yes — 15-day easy returns on unworn items with the original certificate and packaging. Coins and customised pieces are non-returnable.' },
        { question: 'Do you offer a buy-back?', answer: 'Yes. We offer transparent lifetime buy-back on hallmarked gold as per the prevailing gold rate.' },
        { question: 'How long does delivery take?', answer: 'In-stock items ship within 2 business days and are fully insured in transit. Made-to-order pieces take 10–15 days.' },
      ],
      content: '<p>Answers to the questions we hear most often. Still stuck? Email support@jewelly.com.</p>',
      metaTitle: 'FAQ | Jewelly',
      metaDescription: 'Frequently asked questions about hallmarking, certification, returns and delivery.',
    },
    {
      title: 'Shipping & Returns',
      type: 'policy',
      content: '<p>We offer free insured shipping on orders above ₹5,000 (flat ₹99 below that). In-stock items dispatch within 2 business days. Returns are accepted within 15 days for unworn items with the original certificate and packaging; refunds are processed to the original payment method within 5–7 business days.</p>',
      metaTitle: 'Shipping & Returns | Jewelly',
      metaDescription: 'Our shipping, insurance and returns policy.',
    },
    {
      title: 'Privacy Policy',
      type: 'policy',
      content: '<p>We respect your privacy. We collect only the information needed to process your orders and improve your experience, never sell your data, and protect it with industry-standard security. You can request access to or deletion of your data at any time by emailing support@jewelly.com.</p>',
      metaTitle: 'Privacy Policy | Jewelly',
      metaDescription: 'How Jewelly collects, uses and protects your data.',
    },
  ]);

  // ---- Newsletter subscribers ----
  await Subscriber.create([{ email: 'subscriber@example.com' }]);

  // ---- Settings (singleton) ----
  await Settings.create({
    key: 'global',
    siteName: 'Parivar Jewellers',
    tagline: 'Parivar Jewellers - Gold, Silver, Diamond Jewellery Store in Mehsana',
    logo: '/uploads/parivar-logo.jpeg',
    contact: {
      email: 'support@jewelly.com',
      phone: '+91 82829 69651',
      whatsapp: '+91 82829 69651',
      address: 'G-58, Silicon Skyland, Opp Kashi Vishvanath Mahadev Mandir, Radhanpur Road, Gujarat 384002',
    },
    social: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
    },
    announcements: [
      'Free insured shipping on orders above ₹5,000',
      'BIS Hallmarked Gold • Certified Diamonds • Lifetime Maintenance',
    ],
  });

  console.log('✔  Seed complete.');
  console.log(`   Categories: ${categoryData.length}  |  Products: ${productData.length}`);
  console.log(`   Admin login:    ${admin.email}  /  ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
  console.log('   Customer login: customer@jewelly.com  /  Customer@123');
};

// Map a product's material to a palette key for image generation.
function materialKey(p) {
  if (p.category === 'Gold Coins') return 'gold-coins';
  if (p.category === 'Bridal & Wedding') return 'bridal';
  if (p.category === 'Gifts') return 'gifts';
  if (p.material === 'Diamond' || p.material === 'Platinum') return 'diamond';
  if (p.material === 'Silver') return 'silver';
  return 'gold';
}

const run = async () => {
  await connectDB();
  try {
    if (process.argv.includes('--destroy')) {
      await wipe();
      console.log('✔  All data destroyed.');
    } else {
      await seed();
    }
  } catch (err) {
    console.error('✖  Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
