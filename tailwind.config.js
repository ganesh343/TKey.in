export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        telugu: [
          "\"Noto Sans Telugu\"",
          "Gautami",
          "Vani",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 12px 40px -28px rgba(15, 23, 42, 0.35)",
      },
    },
  },
  plugins: [],
};
