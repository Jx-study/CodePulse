import type { TourStep } from '@/shared/components/TourEngine';
import type { RunStage } from '@/types/runStage';
import { ALGORITHM_TO_CONVERTER_KEY } from '@/data/implementations/traceConverters';

/** 上次執行結果（來自 usePlaygroundRun，明確語意） */
type RunOutcome = 'none' | 'running' | 'success' | 'error';

interface BuildPlaygroundTourArgs {
  /** 當下的 runStage，互動 Run step 用來判斷是否已執行完成（done） */
  runStage: RunStage;
  /** 上次執行結果，互動 Run step 用來判斷顯示 running / error 吉祥物 */
  lastRunOutcome: RunOutcome;
  /** 切到動畫 tab（onEnter 用） */
  goAnimationTab: () => void;
  /** 互動 step 按「跳過此步」時直接關閉導覽 */
  skipToEnd: () => void;
  /** 目前停靠在左側的面板 id，互動 drag-dock step 用來偵測是否已完成拖曳 */
  leftDockedId: string | null;
}

// 後端 detected_algorithm（snake_case）→ 中文顯示名稱。
// 僅需涵蓋 ALGORITHM_TO_CONVERTER_KEY 的 key（前端有動畫模板者）。
// 加新演算法時：在 traceConverters 加 converter key + 這裡補顯示名稱。
const ALGO_DISPLAY_NAME: Record<string, string> = {
  bubble_sort: '泡沫排序',
  selection_sort: '選擇排序',
  insertion_sort: '插入排序',
  linear_search: '線性搜尋',
  binary_search: '二分搜尋',
};

/**
 * 取得目前前端有動畫模板的演算法顯示名稱清單（去重）。
 * 做法 B：從 ALGORITHM_TO_CONVERTER_KEY 動態衍生，加新演算法自動同步。
 * 未在 ALGO_DISPLAY_NAME 對應到的 key 退回顯示原始 key（避免漏字）。
 */
export function getSupportedAlgoLabels(): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const key of Object.keys(ALGORITHM_TO_CONVERTER_KEY)) {
    const label = ALGO_DISPLAY_NAME[key] ?? key;
    if (!seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  }
  return labels;
}

/**
 * 產生 Playground 操作導覽步驟（方法 A：互動任務式）。
 * 靜態元素線性介紹；「請點 Run」為互動 step（等 done 才前進）；run 後面板用真實資料介紹。
 */
export function buildPlaygroundTourSteps({
  runStage,
  lastRunOutcome,
  goAnimationTab,
  skipToEnd,
  leftDockedId,
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
      // 等執行完成（done）才前進，確保後續面板有真實資料（修搶跑）
      advanceWhen: () => runStage === 'done',
      // 用明確的 lastRunOutcome 判斷，不從 runStage 猜。
      // 'none' = 尚未點 Run（或 tour 剛開啟時已重設），顯示靜態等待提示而非 Codi。
      waitingState: () => (lastRunOutcome === 'none' ? 'idle' : lastRunOutcome === 'error' ? 'error' : 'running'),
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
      id: 'drag-dock',
      title: '拖曳面板到左側',
      description: '抓住右側工具列（右側橘框）的第一個面板圖示，往左側 bar（左側橘框）拖曳放開，即可將面板停靠到編輯器旁。試試看！',
      targetSelector: '[data-tour="pg-drag-icon"]',
      secondaryTargetSelector: '[data-tour="pg-left-bar"]',
      placement: 'left',
      interactive: true,
      advanceWhen: () => leftDockedId !== null,
      onSkipStep: skipToEnd,
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
