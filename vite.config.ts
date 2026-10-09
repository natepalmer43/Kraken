import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Relative base so the same build works at the repo root, on GitHub Pages
// (/Kraken/), or anywhere else you drop the dist/ folder.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
