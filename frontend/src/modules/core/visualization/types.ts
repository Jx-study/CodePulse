/** Toast API，供 actionHandler 顯示警告等 */
export interface ToastAPI {
  warning: (msg: string) => void;
}

/** ActionHandler 的 context，僅含純函數所需工具 */
export interface ActionContext {
  nextId: () => string;
  toast: ToastAPI;
  /** 用於 reset 等動作，由 hook 傳入 config.defaultData */
  defaultData?: unknown;
}

/** 基礎 Action 型別 */
export interface BaseAction {
  type: string;
  payload: Record<string, unknown>;
}

/**
 * ActionHandler 回傳結果（Strategy 模式）
 * 供 useVisualizationLogic 薄殼統一處理
 */
export interface ActionResult<TData = unknown> {
  /**
   * 傳給 createAnimationSteps 的資料。
   * 風險點 1（BST delete）：動畫需刪除前的帶標記陣列，stateData 需重排後的乾淨陣列。
   */
  animationData: TData;

  /**
   * 傳給 setData 的資料。
   * 若未提供，hook 使用 animationData。
   * 使用者：BST delete（getBSTArrayAfterDelete 的結果）
   */
  stateData?: TData;

  /**
   * 傳給 createAnimationSteps 的第二個參數（動畫 payload）。
   * 風險點 2（Graph removeVertex）：在此明確攜帶 deletedEdges、deletedNodeCoords。
   * 風險點 3：Graph 的 animationParams 須包含完整 { type, ...payload }。
   */
  animationParams?: unknown;

  /**
   * true → hook 以 undefined 呼叫 createAnimationSteps，渲染全量靜態畫面。
   * 用於 random / load / reset / refresh 等重置類動作。
   */
  isResetAction?: boolean;

  /**
   * Graph 類 DS/Algo 需在 createAnimationSteps 後執行 syncCoordinates。
   */
  needsSyncCoordinates?: boolean;

  /**
   * 風險點 3 補充：Graph 的 animationParams 格式與其他 DS 不同。
   * 設為 true 時，hook 跳過通用 { targetId, value } 注入，直接使用 animationParams。
   */
  useRawAnimationParams?: boolean;
}

/**
 * Strategy 模式：config 自帶的 actionHandler 型別
 * 純函數，處理 data 變換，不碰 React state
 */
export type VisualizationActionHandler<TData = unknown, TAction extends BaseAction = BaseAction> = (
  actionType: TAction["type"],
  payload: Record<string, unknown>,
  data: TData,
  context: ActionContext,
) => ActionResult<TData> | null;

/** 視覺化節點（演算法用，含 position） */
export interface AlgorithmNode {
  id: string;
  value?: number | string;
  x?: number;
  y?: number;
  position?: { x: number; y: number };
  [key: string]: any;
}

/** 圖形資料結構 */
export interface GraphData {
  nodes: AlgorithmNode[];
  edges: string[][];
}

/** 視覺化資料：線性陣列或圖形 */
export type VisualizationData = AlgorithmNode[] | GraphData;
