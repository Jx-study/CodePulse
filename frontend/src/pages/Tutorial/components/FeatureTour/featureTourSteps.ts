export interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export const DESKTOP_STEPS: TourStep[] = [
  {
    id: 'swap-button',
    title: '交換佈局',
    description: '點擊此按鈕可以交換左側程式碼面板與右側畫布的位置，找到最適合你的學習佈局。',
    targetSelector: '[data-tour="swap-button"]',
    placement: 'bottom',
  },
  {
    id: 'resize-handle',
    title: '水平調整面板寬度',
    description: '拖動左右面板之間的分隔線，可以自由調整程式碼面板與視覺化區域的寬度比例。',
    targetSelector: '[data-tour="resize-handle"]',
    placement: 'right',
  },
  {
    id: 'resize-handle-v',
    title: '垂直調整面板高度',
    description: '拖動上下面板之間的分隔線，可以自由調整視覺化畫布與資料操作面板的高度比例。',
    targetSelector: '[data-tour="resize-handle-v"]',
    placement: 'right',
  },
  {
    id: 'canvas-panel',
    title: '視覺化畫布',
    description: '這裡是演算法動畫的主要舞台。你可以縮放、平移畫布，觀察每個步驟的變化。',
    targetSelector: '[data-tour="canvas-panel"]',
    placement: 'left',
  },
  {
    id: 'control-bar',
    title: '播放控制列',
    description: '使用播放、暫停、上一步、下一步來控制動畫速度，也可以拖動進度條跳至任意步驟。',
    targetSelector: '[data-tour="control-bar"]',
    placement: 'top',
  },
  {
    id: 'code-panel',
    title: '程式碼面板',
    description: '左側顯示對應的虛擬碼或 Python 實作，當前執行行會自動高亮顯示。',
    targetSelector: '[data-tour="code-panel"]',
    placement: 'right',
  },
];

// Mobile skips steps 1-3 (swap-button, resize-handle, resize-handle-v)
export const MOBILE_STEPS: TourStep[] = DESKTOP_STEPS.slice(3);
