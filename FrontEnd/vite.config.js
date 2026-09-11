import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'replace-api-url',
      transform(code, id) {
        if (!id.includes('/src/')) return null;
        const apiUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
        return { code: code.replaceAll('http://localhost:3000', apiUrl), map: null };
      },
    },
  ],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
  }
})
