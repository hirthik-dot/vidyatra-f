import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  server: {
    host: true,     // 👈 ALLOWS HOTSPOT & LAN ACCESS
    port: 5173,     // 👈 OPTIONAL, useful for clarity
  },
})
