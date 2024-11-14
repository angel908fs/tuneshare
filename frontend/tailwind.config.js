import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import daisyui from 'daisyui';
import daisyUIThemes from "daisyui/src/theming/themes";


export default defineConfig({
  plugins: [react()],
  test:{
    globals:true,
    environment: 'jsdom',
    setupFiles: '.src/setupTests',
  },
});
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],

  daisyui: {
    themes: [
      "light",
      "cyberpunk",
      "luxury",
      "dark",
      "dim",
      {
        black:{
          ...daisyUIThemes["black"],
          primary: "rgb(29,155,240)",
          secondary: "rgb(24,24,24)",

        },
        dark:{
          ...daisyUIThemes["dark"],
          primary: "rgb(226, 21, 18)",
          secondary: "rgb(46,46,46)",
        },
        blueish: {
            ...daisyUIThemes["dark"],
            primary: "#79C0FF", // Soft blue shade for primary elements
            secondary: "#1A73E8", // Slightly deeper blue for secondary elements
        }
      },
    ],
  },
}