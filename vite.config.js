import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/chore-tracker/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Chore Tracker",
        short_name: "Chores",
        description: "Household chore tracker",
        theme_color: "#08090e",
        background_color: "#08090e",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "/chore-tracker/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/chore-tracker/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
