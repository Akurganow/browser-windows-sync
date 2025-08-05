/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
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
  test: {
    globals: true,
    watch: false,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})