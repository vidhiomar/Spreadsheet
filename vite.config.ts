import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1600,
    outDir: 'dist',
  },
  plugins: [
    tailwindcss(),
  ],
})