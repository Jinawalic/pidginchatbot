import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
        proxy: {
            '/api': {
                target: 'https://backendd-eta.vercel.app/',
                changeOrigin: true
            }
        }
    },
    build: {
        outDir: 'build'
    },
    define: {
        'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '/api')
    }
})
