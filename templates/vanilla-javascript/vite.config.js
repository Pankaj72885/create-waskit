import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
// Export the Vite configuration
export default defineConfig({
  // Add the Tailwind CSS plugin to the Vite build process
  plugins: [tailwindcss()],

  // Set the base path for the application when deployed to GitHub Pages
  base: "/",
});
