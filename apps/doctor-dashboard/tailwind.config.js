/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dashboard color palette
        primary: '#1D4ED8',
        'primary-hover': '#1E40AF',
        // Urgency colors
        critical: '#DC2626',
        high: '#EA580C',
        medium: '#CA8A04',
        low: '#16A34A',
      },
    },
  },
  plugins: [],
};
