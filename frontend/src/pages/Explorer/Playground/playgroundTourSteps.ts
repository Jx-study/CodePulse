import type { TourStep } from '@/shared/components/TourEngine';
import type { RunStage } from '@/types/runStage';

interface BuildPlaygroundTourArgs {
  /** 當下的 runStage，互動 Run step 用來判斷是否已開始執行 */
  runStage: RunStage;
  /** 切到動畫 tab（onEnter 用） */
  goAnimationTab: () => void;
  /** 互動 step 按「跳過此步」時直接關閉導覽 */
  skipToEnd: () => void;
}

/**
 * 產生 Playground 操作導覽步驟（方向 B：互動任務式）。
 * 靜態元素線性介紹；「請點 Run」為互動 step；run 後面板用真實資料介紹。
 */
export function buildPlaygroundTourSteps({
  runStage,
  goAnimationTab,
  skipToEnd,
}: BuildPlaygroundTourArgs): TourStep[] {
  return [
    {
      id: 'code-editor',
      title: '程式碼編輯器',
      description: '在左側 main.py 撰寫 Python 程式碼，這裡是你實驗演算法的起點。',
      targetSelector: '[data-tour="pg-editor"]',
      placement: 'right',
    },
    {
      id: 'run-button',
      title: '執行程式碼',
      description: '點擊「Run」執行程式碼，系統會追蹤每一步並產生視覺化。現在就試試看吧！',
      targetSelector: '[data-tour="pg-run"]',
      placement: 'bottom',
      interactive: true,
      advanceWhen: () => runStage !== 'idle',
      onSkipStep: skipToEnd,
    },
    {
      id: 'tab-bar',
      title: '視覺化模式切換',
      description: '執行後這裡可切換「演算法動畫」與「Call Graph / CFG」兩種視覺化模式。',
      targetSelector: '[data-tour="pg-tabbar"]',
      placement: 'bottom',
      onEnter: goAnimationTab,
    },
    {
      id: 'canvas',
      title: '視覺化畫布',
      description: '這裡是主要舞台，呈現演算法每一步的資料變化。可縮放、平移觀察細節。',
      targetSelector: '[data-tour="pg-canvas"]',
      placement: 'left',
    },
    {
      id: 'control-bar',
      title: '播放控制列',
      description: '用播放、暫停、上一步、下一步控制動畫，也可拖動進度條跳至任意步驟、調整速度。',
      targetSelector: '[data-tour="pg-controlbar"]',
      placement: 'top',
    },
    {
      id: 'ai-analysis',
      title: 'AI 分析',
      description: '執行完成後，點此查看 AI 對程式碼的演算法偵測與分析結果。',
      targetSelector: '[data-tour="pg-ai"]',
      placement: 'bottom',
    },
    {
      id: 'right-panels',
      title: '資料面板與工具列',
      description: '右側工具列可開關變數、呼叫堆疊、Console 等面板，即時檢視執行狀態。',
      targetSelector: '[data-tour="pg-right-bar"]',
      placement: 'left',
    },
    {
      id: 'history',
      title: '執行歷史',
      description: '左下角的時鐘圖示可開啟執行歷史，重播先前跑過的程式碼。',
      targetSelector: '[data-tour="pg-history"]',
      placement: 'right',
    },
  ];
}
