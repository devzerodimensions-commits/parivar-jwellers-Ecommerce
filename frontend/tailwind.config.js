/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Luxury jewelry palette: gold, charcoal, cream.
        gold: {
          DEFAULT: '#C8A04B',
          50: '#FBF6E9',
          100: '#F5EBCF',
          200: '#EAD49C',
          300: '#DFBD6B',
          400: '#D4AC53',
          500: '#C8A04B',
          600: '#A6822F',
          700: '#7E6224',
          800: '#5A461a',
          900: '#3B2E11',
        },
        // Deep teal (brand dark) — used for text, dark sections, buttons & badges.
        charcoal: {
          DEFAULT: '#091E26',
          800: '#0E2A33',
          700: '#16404D',
        },
        cream: '#FBF8F1',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -8px rgba(9,30,38,0.18)',
      },
    },
  },
  plugins: [],
};
