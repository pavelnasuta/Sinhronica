import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const base = (() => {
  const raw = process.env.VITE_BASE_PATH?.trim().replace(/^\/+|\/+$/g, '')
  return raw ? `/${raw}/` : '/'
})()

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        clientsClaim: true,
        skipWaiting: false,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
      includeAssets: [
        'favicon.ico',
        'icons/sinhronica-v1-icon-32.png',
        'icons/sinhronica-v1-apple-touch-icon.png',
        'icons/sinhronica-v1-icon-192.png',
        'icons/sinhronica-v1-icon-512.png',
        'icons/sinhronica-v1-icon-maskable-192.png',
        'icons/sinhronica-v1-icon-maskable-512.png',
      ],
      manifest: {
        name: 'Синхроника',
        short_name: 'Синхроника',
        description: 'PWA для спортсменов по синхронному плаванию.',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#08143B',
        theme_color: '#2446CA',
        icons: [
          { src: 'icons/sinhronica-v1-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/sinhronica-v1-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/sinhronica-v1-icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/sinhronica-v1-icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
