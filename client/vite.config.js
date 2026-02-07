import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 1. Tell esbuild to treat .js files as JSX during the build
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.js$/, // Apply only to .js files in src
    exclude: [],
  },
  // 2. Tell esbuild to treat .js files as JSX during dependency scanning
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});