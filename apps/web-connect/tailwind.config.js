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
      vividRed: "#F30919",
      foggyLondon: "#5B5757",
      bloodThirstyWarlock: "#F1183D"
    },
    extend: {
      backgroundImage: {
        "background-image":
          "url('../../../assets/images/sentry-background.png')",
      },
      keyframes: {
        navbarAppear: {
          "0%": { width: "10vw" },
          "100%": { width: "100vw" }
        },
        navbarDisappear: {
          "0%": { width: "100vw", display: "block" },
          "100%": { width: "0", display: "hidden" }
        }
      },
      animation: {
        "navbar-appear": "navbarAppear .2s linear",
        "navbar-disappear": "navbarDisappear .2s linear"
      },
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
