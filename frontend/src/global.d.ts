/**
 * 全局類型聲明檔案
 * 
 * 此檔案用於定義非標準模組（如 CSS 模組、圖片資源等）的 TypeScript 類型聲明。
 * 這些聲明讓 TypeScript 能夠理解和處理 Vite 構建工具轉換的資源檔案。
 * 
 * 功能：
 * - 為 CSS 模組（.module.css/.scss/.sass）提供類型支援
 * - 為圖片資源（.png/.jpg/.gif/.svg 等）提供類型支援
 * - 消除 TypeScript 對這些非 JS/TS 模組的類型錯誤
 * - 提供 IDE 自動完成和類型檢查功能
 */

// CSS 模組類型聲明
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

// 圖片資源類型聲明
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}