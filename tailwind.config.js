/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
      },
      screens: {
        'safe-area': 'screen and (display-mode: standalone)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
