import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // El sitio se publica en https://jorgelimo.github.io/tech-halloween-evaluation/,
  // así que los archivos compilados deben referenciarse desde esa subruta.
  base: '/tech-halloween-evaluation/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
