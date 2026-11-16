/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { pink: '#f8c9d6', blush: '#fde8ee', hot: '#e0457f', matcha: '#d3e4c8', olive: '#55662b', cream: '#fffaf4', ink: '#4a3a40' },
      fontFamily: { display: ['"Instrument Serif"', 'Georgia', 'serif'], sans: ['Poppins', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
