import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Set the base path for the application when deployed to GitHub Pages
  base: "/waskit-react-js/", //Change it with yout github repo name
});
