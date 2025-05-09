import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    host: true,
    proxy: {
      '/api': {
        target: 'https://echoapp-rho.vercel.app',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
