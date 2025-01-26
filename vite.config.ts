import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/rest': {
                target: 'https://rest.wyscout.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/rest/, ''),
                headers: {
                    'Origin': 'https://wyscout.hudl.com'
                }
            },
            '/search': {
                target: 'https://searchapi.wyscout.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/search/, ''),
                headers: {
                    'Origin': 'https://wyscout.hudl.com'
                }
            }
        }
    }
}) 