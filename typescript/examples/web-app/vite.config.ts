import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: "IMJS_",
  plugins: [react()],
  server: {
    open: true,
    host: "localhost",
    port: 3000
  },
  preview: {
    port: 3000,
  }
});