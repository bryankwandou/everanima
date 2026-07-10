/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0f",
        parchment: "#f5f1e8",
        ember: "#e8613c",
        moss: "#3ca877",
        haze: "#8b87a3"
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      }
    }
  },
  plugins: []
};
