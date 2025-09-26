import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
      '/assets': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
      '/data': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
    },
  },
})