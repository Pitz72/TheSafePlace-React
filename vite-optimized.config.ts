import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

// === PERFORMANCE MONITORING ===
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 Vite Development Server Configuration Loaded');
  console.log('📊 Performance monitoring enabled');
}

// Create plugins array with conditional bundle analyzer
const createPlugins = () => {
  const plugins = [react()];
  
  // === BUNDLE ANALYZER ===
  if (process.env.ANALYZE === 'true') {
    const { visualizer } = require('rollup-plugin-visualizer');
    plugins.push(
      visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      })
    );
  }
  
  return plugins;
};

export default defineConfig({
  plugins: createPlugins(),
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@rules': resolve(__dirname, 'src/rules'),
      '@styles': resolve(__dirname, 'src/styles')
    }
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true
    }
  },
  
  // Build configuration
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Bundle optimization
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          // Vendor chunk
          vendor: ['react', 'react-dom'],
          
          // State management
          state: ['zustand'],
          
          // Game logic
          gameLogic: [
            './src/rules/diceRules.ts',
            './src/rules/characterRules.ts',
            './src/rules/gameRules.ts'
          ],
          
          // Utilities
          utils: [
            './src/utils/saveSystem.ts',
            './src/utils/errorHandler.ts'
          ]
        },
        
        // Asset naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext || '')) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          return `assets/[ext]/[name]-[hash].${ext}`;
        }
      },
      
      // External dependencies (if needed)
      external: []
    },
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.debug'] : []
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Asset inlining threshold
    assetsInlineLimit: 4096
  },
  
  // CSS optimization
  css: {
    devSourcemap: true,
    postcss: {
      plugins: []
    }
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'zustand'
    ],
    exclude: []
  },
  
  // Preview server (for production builds)
  preview: {
    port: 4173,
    open: true
  },
  
  // Environment variables
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '0.5.0')
  }
});
