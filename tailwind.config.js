/** @type {import('tailwindcss').Config} */

module.exports = {
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: '#14b8a6',
          50: '#e8f8f6',
          100: '#d0f1ed',
          200: '#a1e3db',
          300: '#72d4ca',
          400: '#43c6b8',
          500: '#14b8a6',
          600: '#109385',
          700: '#0c6e64',
          800: '#084a42',
          900: '#042521',
        },
        'secondary': {
          DEFAULT: '#f59e0b',
          50: '#FFF5EE',
          100: '#FFEADC',
          200: '#FFD8BD',
          300: '#FFC390',
          400: '#FFB15B',
          500: '#F59E0B',
          600: '#C27C07',
          700: '#8F5A03',
          800: '#623C01',
          900: '#351F00',
        },
        'accent': '#10b981', // greenish accent
        'background': {
          DEFAULT: '#c8e6ce',
          50: '#fafdfa',
          100: '#f4faf5',
          200: '#e9f5eb',
          300: '#def0e2',
          400: '#d3ebd8',
          500: '#c8e6ce',
          600: '#a0b8a5',
          700: '#788a7c',
          800: '#505c52',
          900: '#282e29',
        }, // light background
        'danger': '#ef4444', // for errors or alerts
        'login-placeholder-bg': '#0d1b2a',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['"Poppins"', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      spacing: {
        128: '32rem',
        144: '36rem',
      },
      dropShadow: {
        dramatic: '0 4px 6px rgba(0,0,0,0.8), 0 6px 20px rgba(0,0,0,0.6)',
        glow: '0 0 8px rgba(255, 255, 255, 0.8)',
      },
    },
  },
  safelist: [
    { pattern: /bg-primary-\d{2,3}/ },
    { pattern: /text-primary-\d{2,3}/ },
    { pattern: /bg-background-\d{2,3}/ },
    { pattern: /text-background-\d{2,3}/ },
  ],
  plugins: [],
  darkMode: false,
};
