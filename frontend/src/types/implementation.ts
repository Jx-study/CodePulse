import type { ReactNode } from "react";
import type { AnimationStep, ComplexityInfo, CodeConfig } from "@/types";
import type { StatusConfig } from "./statusConfig";
import type { VisualizationActionHandler } from "@/modules/core/visualization/types";
import type { RealWorldStory } from "./realWorldStory";

export type {
  PythonInput,
  PythonDemo,
  GraphSimNode,
  GraphSimEdge,
  GraphOutputData,
  QueueCardOutputData,
} from "./pythonDemo";

export type {
  StoryVideo,
  StoryResourceType,
  StoryResource,
  InteractiveGameType,
  InteractiveGame,
  RealWorldStory,
} from "./realWorldStory";

export interface ProblemReference {
  id: string | number;
  title: string;
  concept: string;
  difficulty: "Easy" | "Medium" | "Hard";
  url: string;
}

export type AlgorithmViewMode =
  | "graph"
  | "grid"
  | "longest_lte"
  | "shortest_gte";

export type RunParams =
  | { type: "sorting" }
  | { type: "searching"; searchValue: number }
  | { type: "prefixSum"; range?: [number, number] }
  | { type: "slidingWindow"; mode: AlgorithmViewMode; targetSum: number }
  | {
      type: "bfsDfs";
      mode: "graph" | "grid";
      startNode?: string;
      endNode?: string;
      rows?: number;
      cols?: number;
    }
  | {
      type: "dijkstra";
      mode: "graph";
      startNode?: string;
      endNode?: string;
      isDirected: boolean;
    }
  | { type: "knapsack"; capacity: number }
  | { type: "nQueens"; nQueensCount: number };

export interface BaseActionBarProps {
  onLoadData: (data: string) => void;
  onResetData: () => void;
  onRandomData: (params?: any) => void;
  onMaxNodesChange?: (count: number) => void;
  disabled?: boolean;
  maxNodes?: number;
}

export interface DSActionBarProps extends BaseActionBarProps {
  onAddNode: (value: number, mode: string, index?: number) => void;
  onDeleteNode: (mode: string, index?: number) => void;
  onSearchNode: (value: number, mode?: string) => void;
  onPeek?: () => void;
  onTailModeChange?: (hasTail: boolean) => void;
  onGraphAction?: (action: string, payload: any) => void;
  isDirected?: boolean;
  onIsDirectedChange?: (val: boolean) => void;
}

export interface AlgoActionBarProps extends BaseActionBarProps {
  onRun: (params?: RunParams) => void;
  viewMode?: AlgorithmViewMode;
  onViewModeChange?: (mode: AlgorithmViewMode) => void;
  currentData?: any;
  isDirected?: boolean;
  onIsDirectedChange?: (val: boolean) => void;
}

export type ActionBarProps = DSActionBarProps | AlgoActionBarProps;

export interface LevelImplementationConfig {
  id: ImplementationId;
  type: "algorithm" | "dataStructure";
  name: string;
  categoryName: string;
  description: string;
  codeConfig: CodeConfig; // 結構化代碼配置（必填）
  complexity: ComplexityInfo;
  introduction: string;
  defaultData: any;
  createAnimationSteps: (
    data: any,
    action?: any,
    config?: any,
  ) => AnimationStep[];
  relatedProblems?: ProblemReference[];
  realWorldStories?: RealWorldStory[];
  statusConfig?: StatusConfig;
  getCodeConfig?: (payload?: any) => CodeConfig;
  /** 最大資料筆數。undefined = 真的不限制（由 viewBox 自動縮放）。 */
  maxNodes?: number;
  /** ActionBar 的預設視圖模式，切換關卡時用來初始化 viewMode state。 */
  defaultViewMode?: AlgorithmViewMode;
  /** 是否預設為有向圖（無 ActionBar toggle 時使用）。 */
  defaultIsDirected?: boolean;
  renderActionBar?: (props: ActionBarProps) => ReactNode;
  /** 可選的 action 處理器（Strategy 模式），用於 useVisualizationLogic 薄殼委派 */
  actionHandler?: VisualizationActionHandler<any>;
}

export type ImplementationId =
  | "array"
  | "linkedlist"
  | "stack"
  | "queue"
  | "tree"
  | "binarytree"
  | "bst"
  | "graph"
  | "bubblesort"
  | "selectionsort"
  | "insertionsort"
  | "mergesort"
  | "quicksort"
  | "binarysearch"
  | "linearsearch"
  | "bfs"
  | "dfs"
  | "dijkstra"
  | "prefixsum"
  | "slidingwindow"
  | "twopointers"
  | "fibonacci"
  | "knapsack"
  | "n-queens"
  | "topological-sort";

export type ImplementationMap = Record<string, LevelImplementationConfig>;
