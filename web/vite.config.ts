import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The curated exercise photos live in the API's wwwroot because the API serves
// them in a single-origin preview. Pointing Vite's public directory there keeps
// one copy of the images instead of a duplicated one under web/.
export default defineConfig({
  plugins: [react()],
  publicDir: "../api/wwwroot",
  server: {
    port: 5173,
    proxy: {
      // The API runs beside Vite in development. One origin in production.
      "/api": "http://localhost:5073",
    },
    fs: {
      allow: [".."],
    },
  },
});
