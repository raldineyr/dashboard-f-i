import { defineConfig } from 'vite';

export default defineConfig({
  // IMPORTANTE: Se o repositório for dashboard-f-i, use '/dashboard-f-i/'
  // Se for o repositório principal do usuário (username.github.io), use '/'
  base: '/dashboard-f-i/',
  
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'chart.js': ['chart.js'],
          'xlsx': ['xlsx']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@core': '/src/core',
      '@parsers': '/src/parsers',
      '@utils': '/src/utils',
      '@config': '/src/config',
      '@assets': '/src/assets'
    }
  },
  css: {
    devSourcemap: true
  }
});