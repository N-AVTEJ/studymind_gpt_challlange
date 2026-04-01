/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: { DEFAULT: "#0A0A0F", 50: "#F5F5F7", 100: "#E8E8ED", 200: "#C8C8D0", 300: "#9898A8", 400: "#6868780", 500: "#484858", 600: "#2E2E3E", 700: "#1A1A28", 800: "#0F0F1A", 900: "#0A0A0F" },
        acid: { DEFAULT: "#C8FF00", 50: "#F7FFD6", 100: "#EDFF99", 200: "#D9FF3D", DEFAULT: "#C8FF00", 400: "#A3CC00", 500: "#7A9900" },
        violet: { DEFAULT: "#7C3AED", 50: "#F5F0FF", 100: "#EDE9FE", 200: "#C4B5FD", 300: "#A78BFA", 400: "#8B5CF6", DEFAULT: "#7C3AED", 600: "#6D28D9" },
        cyan: { DEFAULT: "#00E5FF", 50: "#E0FCFF", 100: "#B3F8FF", 200: "#4DEFFF", DEFAULT: "#00E5FF", 400: "#00B8CC" },
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: { "0%": { opacity: 0, transform: "translateY(24px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        float: { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-12px)" } },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(200,255,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,0,0.03) 1px, transparent 1px)",
        "hero-glow": "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.25), transparent)",
      },
      backgroundSize: { "grid-pattern": "64px 64px" },
    },
  },
  plugins: [],
};
