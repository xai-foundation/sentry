/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.tsx", // paths to your files
    "../../packages/ui/src/**/*.tsx",
  ],
  theme: {
    colors: {
      white: "#fff",
      hornetSting: "#FF0030",
      potBlack: "#181415",
      elementalGrey: "#A19F9F",
      americanSilver: "#D0CFCF",
      darkLicorice: "#181415BF",
      bananaBoat: "#FFC53D1A",
      bananaBoatText: "#FFC53D",
      nulnOil: "#140F0F",
      velvetBlack: "#272123",
    },
    extend: {
      boxShadow: {
        main: "0px 10px 15px #000000BF",
      },
      opacity: {
        75: "0.75",
      },
      screens: {
        sm: "320px",
      },
    },
  },
  plugins: [],
};
