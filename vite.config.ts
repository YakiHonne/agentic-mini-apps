import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Whitelisted domains
const allowedOrigins = [
  "https://yakihonne.com",
  "https://otherdomain.com"
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
        "Access-Control-Allow-Credentials": "true",
        "Content-Security-Policy": 
          mode === 'development' 
            ? "script-src 'self' 'unsafe-eval' https://yakihonne.com" // Only allow eval in dev
            : "script-src 'self' https://yakihonne.com" // Strict in production
      };
    }
  },
  preview: {
    headers: {
      "Access-Control-Allow-Origin": allowedOrigins[0],
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Content-Security-Policy": "script-src 'self' https://yakihonne.com"
    }
  },
  build: {
    target: 'es2015', // More compatible than esnext
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // Only drop in prod
        pure_funcs: [
          'eval',
          'Function',
          'setTimeout',
          'setInterval'
        ],
        passes: 3 // Better optimization
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
        hoistTransitiveImports: false // Prevents eval patterns
      },
      onwarn(warning, warn) {
        if (warning.code === 'EVAL') return; // Silence eval warnings
        warn(warning);
      }
    }
  },
  plugins: [
    react({
      jsxRuntime: 'automatic', // Prefer automatic runtime
      babel: {
        plugins: [
          ['transform-remove-console', { exclude: ['error', 'warn'] }]
        ]
      }
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    legalComments: 'none' // Remove license files
  }
}));