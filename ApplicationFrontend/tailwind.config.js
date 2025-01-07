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
        accent: "rgb(243 244 246 / 0.2)",
        bgCard: "#252728",
        iconColor: "#ffffff1a",
        bgCard2: "#1c1e21",
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif", "Afacad Flux"],
        afacad: ['"Afacad Flux"', "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          background: "rgb(28, 30, 33)",
        },
      },
    ],
  },
};
