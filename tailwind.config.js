const { addDynamicIconSelectors } = require("@iconify/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        "libre-light": ["LibreFranklin-Light"],
        "libre-regular": ["LibreFranklin-Regular"],
        "libre-bold": ["LibreFranklin-Bold"],
        "libre-medium": ["LibreFranklin-Medium"],
      },
      width: {
        "primary-width": "320px",
      },
      height: {
        "primary-height": "48px",
      },
      borderRadius: {
        "primary-radius": "64px",
      },
      backgroundImage: {
        "primary-gradient":
          "radial-gradient(214.49% 49.41% at 50% 49.41%, #F9FFE5 0%, #F4F6F8 100%)",
        "new-primary-gradient":
          "bg-radial-[at_50%_49.41%] from-[#F9FFE5] to-[#F4F6F8] to-100%",
      },
      colors: {
        "primary-white": "#F6F6F6",
        white: "#FFFFFF",
        primary: "#85FA8F",
        "icons-primary": "#5D5D5D",
        secondary: "#B0B0B0",
        "text-primary": "#3D3D3D",
        "accent-primary": "#E7E7E7",
        "green-primary": "#85FA8F",
        "green-secondary": "#D1F5BA",
        "blue-primary": "#1C3647",
        "wallet-button-bg": "#1C3647",
        "wallet-icon-green": "#A7DB8E",
        "violet-primary": "#44235C",
        "violet-secondary": "#9B6FEB",
        "violet-tertiary": "#510032",
        "tertiary-icons": "#D1D1D1",
        "orange-primary": "#EB7F58",
        "green-tertiary": "#3BED4B",
        /** Sustituye el rojo genérico por la escala magenta de marca (base #510032). */
        red: {
          DEFAULT: "#510032",
          50: "#fcf7f9",
          100: "#f5e6ec",
          200: "#ebc9d6",
          300: "#d89fb8",
          400: "#b86288",
          500: "#8a355d",
          600: "#510032",
          700: "#45002a",
          800: "#380023",
          900: "#2c001c",
        },
      },
    },
  },
  plugins: [addDynamicIconSelectors()],
};
