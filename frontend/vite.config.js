import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: './',
    plugins: [react()],
    server: mode === 'development' ? {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        },
        '/auth': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        }
      }
    } : undefined
  }
})
