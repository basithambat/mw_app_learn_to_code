/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/(tabs)/meditate.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        domine: ["Domine", "serif"],
        rmono: ["Roboto-Mono", "monospace"],
        geist: ["Geist", "sans-serif"],
        adamina: ["Adamina", "serif"],
        googleSansFlex: ["GoogleSansFlex", "sans-serif"],
        gentonaBook: ["Gentona-Book"]
      },
      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      }
    },
  },
  plugins: [],
};