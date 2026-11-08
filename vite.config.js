import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  base: '/novenix-games/',
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        arcade: fileURLToPath(new URL('./arcade/index.html', import.meta.url)),
      },
    },
  },
})
