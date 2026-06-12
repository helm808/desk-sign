import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // relative paths for Electron / file:// loading
  server: {
    width: 800,
    height: 480,
  }
})
