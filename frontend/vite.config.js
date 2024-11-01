import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
/*
Vite Config is for local development, 
configuring the development server via proxy,
Adding plugins for framework support and custom features
Customizing build output and optimization
managing environment variables
*/

export default defineConfig({
  plugins: [react()],
  server: {
    // port:3000
    proxy:{ // directs specific paths from the frontend to backend
      '/api': {
        target: 'http://localhost:8080', // specifices the backend server url
        changeOrigin:true, // adujusts the origin header to match the backend server, useful for CORS
      }
    }
  }
})
