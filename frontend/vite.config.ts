import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig((_env) => {
  const isAnalyze = process.env.ANALYZE === 'true';

  return {
    plugins: [
      react(),
        // Gzip 壓縮
      viteCompression({
        algorithm: "gzip",
        ext: ".gz",
        threshold: 10240,
        deleteOriginFile: false,
      }),
      ,
      // Bundle 分析（ANALYZE=true npm run build）
      ...(isAnalyze
        ? [
            visualizer({
              open: true,
              filename: "dist/stats.html",
              gzipSize: true,
              brotliSize: true,
            }),
          ]
        : []),
    ],
    server: {
      host: true, // 等同於 --host，讓外部可以連接
      port: 5173, // 預設端口
      watch: {
        usePolling: true, // Docker volume mount 需要 polling 才能偵測檔案變化
      },
      proxy: {
        "/api": {
          target: process.env.PROXY_TARGET || "http://localhost:5000",
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
            cytoscape: ["cytoscape", "cytoscape-dagre"],
            d3: ["d3"],
            motion: ["motion"],
            "dnd-kit": [
              "@dnd-kit/core",
              "@dnd-kit/sortable",
              "@dnd-kit/utilities",
            ],
            "resizable-panels": ["react-resizable-panels"],
            // fa icon 資料包不列入 manualChunks → 讓 rollup treeshake 未使用的 icon
            // 只保留 runtime core
            "fa-core": [
              "@fortawesome/fontawesome-svg-core",
              "@fortawesome/react-fontawesome",
            ],
          },
        },
      },
    },
  };
});
