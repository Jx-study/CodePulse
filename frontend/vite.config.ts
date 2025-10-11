import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    // historyApiFallback: true, // 支持 HTML5 History API
    host: true,               // 等同於 --host，讓外部可以連接
    port: 5173                // 預設端口
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 全局注入css的變數 & mixins
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: 
        `
          @use "@/shared/styles/_variables" as *;
          @use "@/shared/styles/_mixins" as *;
        `
      }
    }
  },
  // 代碼分割優化
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend'],
          monaco: ['@monaco-editor/react']
        }
      }
    }
  }
});
