/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.tsx', // paths to your files
    "../../packages/ui/src/**/*.tsx",
  ],
  theme: {
    colors: {
      "white": "#fff",
      "hornetSting": "#FF0030",
      "potBlack": "#181415",
      "elementalGrey": "#A19F9F",
      "americanSilver": "#D0CFCF",
    },
    extend: {
      opacity: {
        "75": "0.75"
      }
    },
  },
  plugins: [],
}
