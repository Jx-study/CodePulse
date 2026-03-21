import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import path from 'path';

export default defineConfig((_env) => {
  return {
    plugins: [
      {
        // Gzip 壓縮
      ...viteCompression({
        algorithm: "gzip",
        ext: ".gz",
        threshold: 10240,
        deleteOriginFile: false,
      }),
      apply: "build",
      },
    ],
    server: {
      host: true, // 等同於 --host，讓外部可以連接
      port: 5173, // 預設端口
      watch: {
        usePolling: true, // Docker volume mount 需要 polling 才能偵測檔案變化
      },
      proxy: {
        '/api': {
          target: process.env.PROXY_TARGET || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    // 依賴預構建優化
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "i18next",
        "react-i18next",
        "i18next-browser-languagedetector",
        "@fortawesome/fontawesome-svg-core",
        "@fortawesome/react-fontawesome",
        "@fortawesome/free-solid-svg-icons",
        "@fortawesome/free-regular-svg-icons",
      ],
      force: false, // 不強制重新預構建，使用快取
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // 全局注入css的變數 & mixins
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          additionalData: `
          @use "@/shared/styles/_variables" as *;
          @use "@/shared/styles/_mixins" as *;
        `,
        },
      },
    },
    // 代碼分割優化
    build: {
      cssCodeSplit: true, // 啟用 CSS 代碼分割
      chunkSizeWarningLimit: 1000, // 設置 chunk 大小警告限制
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom"],
            router: ["react-router-dom"],
            i18n: [
              "i18next",
              "react-i18next",
              "i18next-browser-languagedetector",
            ],
            monaco: ["@monaco-editor/react"],
            d3: ["d3"],
            icons: [
              "@fortawesome/fontawesome-svg-core",
              "@fortawesome/free-solid-svg-icons",
              "@fortawesome/free-regular-svg-icons",
              "@fortawesome/react-fontawesome",
            ],
          },
        },
      },
    },
  };
});
