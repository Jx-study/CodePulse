export interface PythonInput {
  label: string;
  variable: string;
  type: 'slider' | 'text' | 'select';
  default: number | string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  visibleWhen?: { variable: string; value: string | number };
}

export interface PythonDemo {
  title: string;
  code: string;
  inputs?: PythonInput[];
  outputType?: 'text' | 'graph' | 'queue-card' | 'maze' | 'flood-fill'; // 預設 'text'，向下兼容
}


export interface MazeCell {
  right: boolean;
  down: boolean;
}

export interface MazeOutputData {
  width: number;
  height: number;
  grid: MazeCell[][];
  start: [number, number];
  finish: [number, number];
  // DFS 生成步驟序列。forward: [fx,fy,tx,ty]；backtrack: [bx,by,-1,-1] 
  generationSteps?: [number, number, number, number][];
}

export interface GraphSimNode {
  id: number;
  name: string;
  group: number;      // 社群編號，0 = "You"
  degree: number;     // 實際好友數
  centrality: number; // 0.0 ~ 1.0，degree / max_degree
  // D3 mutation（simulation 執行後存在）
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphSimEdge {
  source: number | GraphSimNode;
  target: number | GraphSimNode;
  type: 'friend' | 'recommend';
}

export interface GraphOutputData {
  nodes: GraphSimNode[];
  edges: GraphSimEdge[];
  you_friends: number[];     // You（id=0）的直接好友 id 列表
  recommendations: number[]; // 推薦節點 id 列表（三元閉包找出）
}

export interface QueueCardOutputData {
  initial_cards: Array<{ id: number; type: 'cat' | 'dog'; url: string }>;
  config: {
    spawn_rate_ms: number;
    max_queue_size: number;
    survive_seconds: number;
  };
}

/** BFS Flood Fill 互動畫布：Python 只輸出尺寸與圖案元資料，邊線 grid 由前端 Canvas 光柵化 */
export interface FloodFillOutputData {
  width: number;
  height: number;
  pattern: 'ring' | 'star' | 'heart' | 'concentric' | 'grid-rooms' | string;
  border_width: number;
}
