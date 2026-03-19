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
} from './pythonDemo';

export type {
  StoryVideo,
  StoryResourceType,
  StoryResource,
  InteractiveGameType,
  InteractiveGame,
  RealWorldStory,
} from './realWorldStory';

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

export interface RunParams {
  searchValue?: number;
  range?: [number, number];
  mode?: AlgorithmViewMode;
  rows?: number;
  cols?: number;
  startNode?: string;
  endNode?: string;
  targetSum?: number;
  isDirected?: boolean;
  capacity?: number;
}

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
  id: string;
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
  | "graph"
  | "bubblesort"
  | "selectionsort"
  | "insertionsort"
  | "binarysearch"
  | "linearsearch"
  | "prefixsum"
  | "slidingwindow"
  | "twopointers"
  | "fibonacci"
  | "knapsack";

export type ImplementationMap = Record<string, LevelImplementationConfig>;
