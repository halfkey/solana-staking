const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        secondary: colors.gray,
        'crypto-dark': '#111827',
        'crypto-medium': '#1F2937',
        'crypto-light': '#374151',
        'crypto-accent': '#3B82F6',
        'crypto-text': '#F3F4F6',
        'crypto-muted': '#9CA3AF',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
    },
  },
}
