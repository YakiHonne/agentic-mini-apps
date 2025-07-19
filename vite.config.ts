import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Correct whitelisted domains (without paths)
const allowedOrigins = [
  "https://yakihonne.com",
  "https://www.yakihonne.com" // Add more domains as needed
];

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: (req) => {
      const origin = req.headers.origin || '';
      const isAllowed = allowedOrigins.includes(origin);
      
      return {
        "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true"
      };
    }
  },
  preview: {
    headers: {
      // Preview typically uses one origin - choose first or implement similar logic
      "Access-Control-Allow-Origin": allowedOrigins[0],
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true"
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));