/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.tsx', // paths to your files
    "../../packages/ui/src/**/*.tsx",
  ],
  theme: {
    colors: {
      "hornetSting": "#FF0030"
    },
    extend: {},
  },
  plugins: [],
}
