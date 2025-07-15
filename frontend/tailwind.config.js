/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        uniBlue: "#2e439d",
        uniGold: "#f7c236",
        uniWhite: "#fffefc",
      },
      screens: {
        xs: "400px",
      },
    },
  },
  plugins: [],
};
