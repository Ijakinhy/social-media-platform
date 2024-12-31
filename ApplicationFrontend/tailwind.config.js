/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bgSupport: "var(--bg-support)",
        borderSupport: "var(--border-support)",
        bgOpacity: "rgba(238, 241, 243, 0.2)",
        bgDropDown: "#1a2a2b",
        accent: "#d6caca1f",
        bgCard: "#1c1e21",
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          background: "#181C1Fff",
        },
      },
    ],
  },
};
