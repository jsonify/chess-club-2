import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: process.env.GITHUB_PAGES ? '/chess-club/' : '/',
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
});