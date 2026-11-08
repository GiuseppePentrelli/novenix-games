import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/novenix-games/games/indovina-chi/',
  plugins: [react()],
})
