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
        charcoal: {
          DEFAULT: '#1A1A1A',
          800: '#222222',
          700: '#2E2E2E',
        },
        cream: '#FBF8F1',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -8px rgba(26,26,26,0.18)',
      },
    },
  },
  plugins: [],
};
