import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@mas/ui': path.resolve(__dirname, 'src/packages/ui/index.ts'),
      '@mas/utils': path.resolve(__dirname, 'src/utils'),
      '@mas/theme': path.resolve(__dirname, 'src/stores/themeStore.ts'),
    },
  },
});
