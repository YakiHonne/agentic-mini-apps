import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "db154d5e3dd4.ngrok-free.app",
      ".ngrok-free.app",
      ".ngrok.app",
      ".ngrok.io",
      "yakihonne.com",
      "www.yakihonne.com",
      "app.yakihonne.com",
      "staging.yakihonne.com",
    ],
    cors: {
      origin: [
        "https://yakihonne.com",
        "https://www.yakihonne.com",
        "https://app.yakihonne.com",
        "https://staging.yakihonne.com",
        "https://db154d5e3dd4.ngrok-free.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      credentials: true,
    },
  },
  define: {
    global: "globalThis",
  },
});
