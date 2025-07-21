import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/my-nostr-widget/', // 👈 GitHub repo name here
  plugins: [react()],
});
