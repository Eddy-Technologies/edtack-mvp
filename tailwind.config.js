/** @type {import('tailwindcss').Config} */

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#14b8a6', // your brand primary color
        secondary: '#f59e0b', // e.g., orange
        accent: '#10b981', // greenish accent
        background: '#c8e6ce', // light background
        danger: '#ef4444' // for errors or alerts
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
  plugins: [],
};
