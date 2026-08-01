// Top-navigation category taxonomy (mega-menu).
// Each item links to a product search so it shows matching pieces.
// Edit this list any time to change the store's browse categories.

export const MEGA_MENU = [
  {
    title: 'Jewellery',
    cols: 3,
    items: [
      'Chain', 'Jewellery Set', 'Jhumka', 'Necklace', 'Rings', 'Locket',
      'Bangles', 'Earrings', 'Haram', 'Bracelets', 'Pendant', 'Kada',
      'Nose Studs', 'Anklets', 'Payal', 'Choker Set', 'Pearl', 'Second Stud',
      'Daily Wear', 'Studs', 'Vaddanam', 'Moti Set',
    ],
  },
  {
    title: 'Metals',
    cols: 1,
    items: ['Gold', 'Diamond', 'Silver', 'Platinum', 'Gemstone', 'White Gold', 'Rose Gold'],
  },
  {
    title: 'Wedding',
    cols: 1,
    items: ['Bridal Set', 'Mangalsutra', 'Couple Rings', 'Engagement Rings', 'Bridal Nath', 'Maang Tikka', 'Anniversary'],
  },
  {
    title: 'For',
    cols: 1,
    items: ['Baby', 'Kids', 'Girls', 'Boys', 'Men', 'Women', 'Bride', 'Groom'],
  },
  {
    title: 'Others',
    cols: 1,
    items: ['Antique', 'Traditional', 'Navaratna', 'Temple Jewellery', 'Lakshmi Jewellery', 'Name Rings', 'Gold Coin'],
  },
  {
    title: 'Purity',
    cols: 1,
    items: ['18 Carat', '20 Carat', '22 Carat', '24 Carat'],
  },
];

// Product-field values these menu items map to, so results are EXACT (by field),
// not just a text match on the product name.
const MATERIALS = ['Gold', 'Diamond', 'Silver', 'Platinum', 'Gemstone']; // Product.material enum
const GENDERS = ['Women', 'Men', 'Kids', 'Unisex']; // Product.gender enum
const CARATS = { '18 Carat': '18', '20 Carat': '20', '22 Carat': '22', '24 Carat': '24' };

// Where each mega-menu item points:
//   • Metals → filter by the product's Material field   (e.g. Gold, Diamond)
//   • For    → filter by the product's Gender field     (e.g. Women, Men, Kids)
//   • Purity → filter by the product's Purity field     ("22" matches 22K / 22 Carat)
//   • Everything else → keyword search across name / tags / description.
export const menuLink = (item, group) => {
  if (group === 'Metals' && MATERIALS.includes(item)) return `/shop?material=${encodeURIComponent(item)}`;
  if (group === 'For' && GENDERS.includes(item)) return `/shop?gender=${encodeURIComponent(item)}`;
  if (group === 'Purity' && CARATS[item]) return `/shop?purity=${CARATS[item]}`;
  return `/search?q=${encodeURIComponent(item)}`;
};
