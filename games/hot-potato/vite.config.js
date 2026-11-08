import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/novenix-games/games/hot-potato/',
  plugins: [react()],
})
