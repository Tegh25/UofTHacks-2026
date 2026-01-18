/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // High contrast accessible palette
        primary: '#1D4ED8',
        'primary-hover': '#1E40AF',
        success: '#15803D',
        warning: '#B45309',
        danger: '#B91C1C',
        neutral: '#374151',
      },
    },
  },
  plugins: [],
};
