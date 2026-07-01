import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const canvasBaseUrl = (env.VITE_CANVAS_BASE_URL ?? '').replace(/\/$/, '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxies Canvas API calls through the dev server so the browser
        // never talks to instructure.com directly — Canvas doesn't send
        // CORS headers, so a direct fetch from the browser is blocked.
        '/canvas-api': {
          target: canvasBaseUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/canvas-api/, '/api/v1'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.VITE_CANVAS_TOKEN ?? ''}`)
            })
          },
        },
      },
    },
  }
})
