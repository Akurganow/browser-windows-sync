/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4171,
    open: true
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  define: {
    global: 'globalThis',
  },
  // @ts-ignore
  test: {
    globals: true,
    watch: false,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})