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

// Where each mega-menu item points. Uses the site search so it lists
// products matching that keyword (e.g. "Necklace", "Gold", "22 Carat").
export const menuLink = (item) => `/search?q=${encodeURIComponent(item)}`;
