import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    // ⚡ F2: Build optimizations for maximum performance
    build: {
      // Enable code splitting for smaller chunks
      rollupOptions: {
        output: {
          // Split vendor chunks to maximize caching
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'vendor-motion': ['framer-motion', 'motion'],
            'vendor-ui': ['lucide-react', 'sonner', 'clsx', 'tailwind-merge'],
            'vendor-charts': ['recharts'],
            'vendor-pdf': ['jspdf', 'pdf-lib'],
          }
        }
      },
      // Reduce chunk size warnings threshold
      chunkSizeWarningLimit: 1000,
      // Enable source maps for production debugging
      sourcemap: false,
      // Minify with esbuild (faster)
      minify: 'esbuild',
      // Target modern browsers for smaller bundles
      target: 'es2020',
    },
    // ⚡ Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'lucide-react',
        'sonner',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
      ],
    },
  };
});
