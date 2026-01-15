import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import basicSsl from '@vitejs/plugin-basic-ssl'
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
    basicSsl()
  ],
  define: {
    'global': 'window',
    'process.env': {}
  },
  server: {
    port: 3000
  }
})
