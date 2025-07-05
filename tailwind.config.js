module.exports = {
  content: [
    "./popup/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./popup/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        80: "20rem",
      },
    },
    darkMode: "class",
    plugins: [],
  },
};
