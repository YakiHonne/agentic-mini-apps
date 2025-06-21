import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'Swipestr',
                short_name: 'Swipestr',
                description: 'Nostr NIP-75 Swipestr PWA',
                theme_color: '#ffffff',
                background_color: '#232946', // Add background color for maskable icons
                display: 'standalone',
                icons: [
                    {
                        src: '/icon.jpeg',
                        sizes: '192x192',
                        type: 'image/jpeg',
                        purpose: 'any maskable', // Allow system to round icon if supported
                    },
                    {
                        src: '/icon.jpeg',
                        sizes: '512x512',
                        type: 'image/jpeg',
                        purpose: 'any maskable',
                    },
                ],
            },
        })],
    resolve: {
        alias: {
            buffer: 'buffer',
            '@': path.resolve(__dirname, './src'),
        },
    },
    define: {
        'process.env': {},
        global: 'window',
    },
});
