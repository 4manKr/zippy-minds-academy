import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:    "#1d4ed8",
          "blue-light": "#3b82f6",
          purple:  "#7c3aed",
          orange:  "#f97316",
          yellow:  "#eab308",
          pink:    "#ec4899",
          teal:    "#14b8a6",
          green:   "#22c55e",
          navy:    "#1e3a8a",
        },
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-in":       "fadeIn 0.5s ease-in-out",
        "slide-up":      "slideUp 0.5s ease-out",
        "slide-down":    "slideDown 0.3s ease-out",
        float:           "float 3s ease-in-out infinite",
        "pulse-slow":    "pulse 3s ease-in-out infinite",
        "gradient-shift":"gradientShift 8s ease infinite",
        "bounce-slow":   "bounce 2s infinite",
        wiggle:          "wiggle 1s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:        { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp:       { "0%": { transform: "translateY(20px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        slideDown:     { "0%": { transform: "translateY(-10px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        float:         { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        gradientShift: { "0%, 100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
        wiggle:        { "0%, 100%": { transform: "rotate(-3deg)" }, "50%": { transform: "rotate(3deg)" } },
      },
      backgroundSize: { "300%": "300%" },
      boxShadow: {
        glow:        "0 0 20px rgba(124, 58, 237, 0.35)",
        "glow-blue": "0 0 20px rgba(29, 78, 216, 0.35)",
        "glow-orange":"0 0 20px rgba(249, 115, 22, 0.35)",
        card:        "0 4px 24px rgba(0, 0, 0, 0.08)",
        "card-hover":"0 8px 40px rgba(0, 0, 0, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
