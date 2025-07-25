import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  plugins: [
    tailwindcss(),
  ],
})