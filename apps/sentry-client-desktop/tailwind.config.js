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
      primaryBgColor: "#140F0F",
      secondaryBgColor: "#201C1C",
      primaryBorderColor: "#2A2828",
      secondaryBorderColor: "#5B5757",
      primaryTooltipColor: "#FFC53D",
      successText: "#3DD68C",
      successBgColor: "#3DD68C1A",
      dropdownPrimaryBg: "#151010",
      dropdownPrimaryHoverBg: "#FF2C3A",
      dropdownSecondaryBg: "#272123",
      dropdownItemPrimaryHoverBg: "#231D1F",
    },
    extend: {},
  },
  plugins: [],
};
