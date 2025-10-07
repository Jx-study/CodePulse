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
  }
});
