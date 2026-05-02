/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f6f1ff",
          100: "#efe5ff",
          200: "#ddcbff",
          300: "#c3a2ff",
          400: "#a473ff",
          500: "#7c3aed",
          600: "#6d28d9",
          700: "#5b21b6",
          800: "#4c1d95",
          900: "#2e1065"
        },
        ink: "#121a33",
        soft: "#6b789b",
        line: "#e8e5fb",
        shell: "#fbfaff"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(108, 48, 255, 0.12)",
        card: "0 12px 40px rgba(28, 39, 84, 0.08)"
      },
      backgroundImage: {
        "hero-orb":
          "radial-gradient(circle at top, rgba(124,58,237,0.18), transparent 40%), radial-gradient(circle at bottom right, rgba(56,189,248,0.12), transparent 28%), linear-gradient(180deg, #ffffff 0%, #f9f7ff 100%)"
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      borderRadius: {
        "4xl": "2rem"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 4s linear infinite"
      }
    }
  },
  plugins: []
};
