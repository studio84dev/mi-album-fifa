/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'accent-blue': '#3b82f6',
        'accent-blue-hover': '#2563eb',
        'accent-orange': '#e8742a',
        'accent-orange-hover': '#d4621c',
      },
    },
  },
  plugins: [],
}
