/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.tsx", // paths to your files
    "../../packages/ui/src/**/*.tsx",
  ],
  theme: {
    colors: {
      white: "#fff",
      btnPrimaryBgColor: "#FF0030",
      linkBgHover: "#433F3F",
      secondaryText: "#A19F9F",
      primaryText: "#D0CFCF",
    },
    extend: {},
  },
  plugins: [],
};
