import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 支持本地开发和 Docker 环境
// 本地开发: VITE_API_TARGET 未设置，使用 localhost
// Docker: VITE_API_TARGET=http://backend:8000
const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true
      }
    }
  }
})
