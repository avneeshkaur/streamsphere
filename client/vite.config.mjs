// F:\PLACEMENT PROJECT\STREAMSPHERE\StreamSphere\client\vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist'
  }
})
