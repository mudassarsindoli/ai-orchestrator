import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ms: {
          blue: "#0078D4",
          "blue-hover": "#106EBE",
          "blue-light": "#E8F4FD",
          "blue-50": "#F0F6FC",
        },
        canvas: {
          DEFAULT: "#FAFAFA",
          deep: "#F5F5F5",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dim: "#F3F2F1",
          container: "#FAFAFA",
        },
        bline: {
          DEFAULT: "#EDEBE9",
          strong: "#D2D0CE",
        },
        txt: {
          DEFAULT: "#323130",
          secondary: "#605E5C",
          disabled: "#A19F9D",
        },
        success: "#107C10",
        error: "#D13438",
        warning: "#FFB900",
      },
      fontFamily: {
        sans: [
          "Segoe UI",
          "-apple-system",
          "BlinkMacSystemFont",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
        mono: ["Cascadia Code", "Consolas", "Menlo", "monospace"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.15s ease-out",
        "slide-in-right": "slide-in-right 0.2s ease-out",
        "slide-in-left": "slide-in-left 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
