import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [
    react(),
    mkcert(), // 🔥 Enables HTTPS with local certificates
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],

      manifest: {
        name: "Vidyatra",
        short_name: "Vidyatra",
        description: "Smart Curriculum Attendance & AI Learning System",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },

      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,png,svg}"],
      },
    }),
  ],

  server: {
    https: true, // 🔥 HTTPS enabled for GPS & secure geolocation
    host: true,  // 🔥 Allows LAN/mobile devices to connect (hotspot)
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
