import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 'prompt' (not 'autoUpdate'): a new deploy is fetched and cached in the
      // background, but never force-reloads a page that's already open — an
      // in-progress match must never get yanked out from under the scorer.
      // It takes over next time the app is fully closed and reopened.
      registerType: 'prompt',
      includeAssets: [
        'favicon-32.png',
        'favicon-64.png',
        'apple-touch-icon.png',
        'badge.png',
        'crest.png',
      ],
      manifest: {
        name: 'Quockarr — Cricket Scorer',
        short_name: 'Quockarr',
        description: 'Ball-by-ball cricket scoring, offline and mobile-first.',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#0a0c10',
        theme_color: '#0a0c10',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the whole app shell (JS/CSS/fonts/icons) so the app opens
        // and scores with zero network — critical for a ground with no signal.
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
