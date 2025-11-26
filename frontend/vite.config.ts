import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    proxy: {
      "/api": {
        target: "https://api.tryollie.io",
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: ["tryollie.io", "www.tryollie.io"], // 👈 Add this
    host: "0.0.0.0", // 👈 Required so Vite listens on your droplet IP, not just localhost
    port: 5173,
  },
});
