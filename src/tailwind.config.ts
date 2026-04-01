import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-syne)", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};

export default config;