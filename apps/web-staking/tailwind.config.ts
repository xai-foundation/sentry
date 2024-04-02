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
      },
      screens: {
        sm: "320px",
      },
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
            shadowGrey: "#00000008"
          }, // light theme colors
        },
        // Removed dark theme configuration to force light mode
        // ... custom themes
      },
    }),
  ],
};
export default config;

