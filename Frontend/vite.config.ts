import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    hmr: {
      overlay: false // Disable HMR overlay to see console errors better
    },
  },
  base: './',
  build: {
    sourcemap: true,
    outDir: 'dist',
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});
