/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Define the colors based on the image
        'mint-cream': '#F0FFF4', // Light background
        'teal-100': '#C6F6D5', // Lighter teal accents
        'teal-200': '#9AE6B4', // Light green background circle
        'teal-600': '#38B2AC', // Primary teal for buttons, icons, links
        'teal-700': '#2C7A7B', // Darker teal for buttons, text
        'teal-800': '#285E61', // Darkest teal for footer, text
        'gray-700': '#4A5568', // Dark text for light mode
        'gray-800': '#2D3748', // Dark background for cards in dark mode
        'gray-900': '#1A202C', // Dark background for body in dark mode
        // Add other custom colors if needed
      },
    },
  },
  plugins: [],
}
