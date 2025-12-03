import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Относительные пути (важно!)
  // outDir не пишем, по умолчанию это 'dist', что нам и нужно
})