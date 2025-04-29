
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite-plugin";
// Export the Vite configuration
export default defineConfig({
  // Add the Tailwind CSS plugin to the Vite build process
  plugins: [tailwindcss()],

  // Set the base path for the application when deployed to GitHub Pages
  base: "/waskit-vanilla-ts/", //Change it with yout github repo name
});
