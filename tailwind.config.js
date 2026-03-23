/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "#028090",
          mint: "#02C39A",
          dark: "#1F2937",
          soft: "#E6FFFA",
        },
      },
      boxShadow: {
        glow: "0 20px 45px -25px rgba(2, 128, 144, 0.55)",
      },
      backgroundImage: {
        hero: "linear-gradient(135deg, rgba(2,128,144,0.96), rgba(2,195,154,0.82))",
        panel: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.75))",
      },
      fontFamily: {
        display: ["Trebuchet MS", "Verdana", "sans-serif"],
        body: ["Avenir Next", "Segoe UI", "sans-serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
