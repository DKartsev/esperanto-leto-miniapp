import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const { WEBAPP_URL } = process.env;
let hmr;

if (WEBAPP_URL) {
  try {
    const url = new URL(WEBAPP_URL);
    hmr = {
      protocol: url.protocol === 'https:' ? 'wss' : 'ws',
      host: url.hostname,
      clientPort: url.protocol === 'https:' ? 443 : url.port || 5173,
    };
  } catch {
    // invalid URL; ignore
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  // Use relative paths so the app renders correctly when served from a subfolder
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    hmr,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: 'index.html',
      output: {
        dir: 'dist',
        format: 'esm',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  publicDir: 'public'
});