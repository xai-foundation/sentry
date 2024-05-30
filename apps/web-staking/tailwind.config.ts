import type { Config } from "tailwindcss";
const { nextui } = require("@nextui-org/react");

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "background-image":
          "url('../assets/images/background.png'), linear-gradient(180deg, #221D1D 0%, #221D1D 100%)",
      },
      keyframes: {
        modal: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        }
      },
      animation: {
        "modal-appear": "modal .3s ease-in-out"
      },
      screens: {
        sm: "320px",
      },
      opacity: {
        "10": ".1",
        "25": ".25",
        "75": ".75",
        "85": ".85",
        "90": ".90"
      }
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      darkMode: false, // Force light mode by setting darkMode to false
      prefix: "nextui", // prefix for themes variables
      addCommonColors: false, // override common colors (e.g. "blue", "green", "pink").
      defaultTheme: "light", // default theme from the themes object
      defaultExtendTheme: "light", // default theme to extend on custom themes
      layout: {}, // common layout tokens (applied to all themes)
      themes: {
        light: {
          layout: {}, // light theme layout tokens
          colors: {
            //TODO get colors for dark theme
            red: "#f30919",
            lightBlackDarkWhite: "#181818",
            lightWhiteDarkBlack: "#ffffff",
            lightWhitedarkWhite: "#ffffff",
            creme: "#00000008",
            silverMist: "#E5E5E5",
            graphiteGray: "#4A4A4A",
            slateGray: "#808080",
            steelGray: "#8D8D8D",
            whisperWhite: "#EEEEEE",
            crystalWhite: "#F9F9F9",
            palePearl: "#EBEBEB",
            midnight: "#171717",
            lightGrey: "#cfcfd1",
            shadowGrey: "#00000008",
            hornetSting: "#FF0030", //rebranding colors start
            pelati: "#FF2C3A",
            grenadinePink: "#FF5D69",
            rubberRadish: "#FF99A0",
            pinkAndSleek: "#FFC3C7",
            sweetMallow: "#FFDEE0",
            sefidWhite: "#FFF0F1",
            reEntryRed: "#CF0614",
            crispChristmasCranberries: "#AB0914",
            netherWorld: "#8D0F18",
            brandyWine: "#4D0207",
            nulnOil: "#140F0F",
            dynamicBlack: "#201C1C",
            chromaphobicBlack: "#2A2828",
            darkRoom: "#433F3F",
            foggyLondon: "#5B5757",
            dugong: "#726F6F",
            elementalGrey: "#A19F9F",
            americanSilver: "#D0CFCF",
            white: "#FFFFFF",
            caparolGrey: "#E4E4E4",
            melanzaneBlack: "#1A1819",
            velvetBlack: "#272123",
            tourchRed: "#F1183D",
            bananaBoat: "#FFC53D",
            afterDark: "#3B3335",
            nulnOilBackground: "#140F0FBF",
            blazeOrange: "#F76808",
            greyBorders: "#524D4F",
            drunkenDragonFly: "#3DD68C"//rebranding colors end
          }, // light theme colors
        },
        // Removed dark theme configuration to force light mode
        // ... custom themes
      },
    }),
  ],
};
export default config;
