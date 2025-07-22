import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missing = requiredVars.filter((key) => !env[key]);

  if (missing.length > 0) {
    console.warn(`\u274c Missing required .env variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  return {
    base: '/',
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.ts',
      include: ['src/**/*.test.{ts,tsx}'],
    },
    server: {
      host: true,
      port: 5173,
      historyApiFallback: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    publicDir: 'public',
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
  };
});
