import React from "react";
import type { LevelImplementationConfig } from "@/types/implementation";

interface SmartActionBarProps {
  // 關卡配置
  topicTypeConfig: LevelImplementationConfig | null;

  // 通用操作 (兩個 ActionBar 都需要)
  onLoadData: (data: string) => void;
  onRandomData: () => void;
  onResetData: () => void;
  disabled?: boolean;

  // 演算法特定
  onRun?: (params?: { searchValue?: number; range?: [number, number] }) => void;
  viewMode?: "graph" | "grid";
  onViewModeChange?: (mode: "graph" | "grid") => void;
  currentData?: any;

  // 資料結構特定
  onAddNode?: (value: number, mode: string, index?: number) => void;
  onDeleteNode?: (mode: string, index?: number) => void;
  onSearchNode?: (value: number, mode?: string) => void;
  onPeek?: () => void;
  onMaxNodesChange?: (max: number) => void;
  onTailModeChange?: (hasTail: boolean) => void;

  // Graph 特定
  onGraphAction?: (action: string, payload: any) => void;
  isDirected?: boolean;
  onIsDirectedChange?: (val: boolean) => void;
  onLimitExceeded?: () => void;
}

export const SmartActionBar: React.FC<SmartActionBarProps> = (props) => {
  const { topicTypeConfig, ...restProps } = props;

  if (!topicTypeConfig) {
    return <div>載入中...</div>;
  }

  if (topicTypeConfig.renderActionBar) {
    return <>{topicTypeConfig.renderActionBar(restProps as any)}</>;
  }

  return <div>此主題暫無操作介面</div>;
};
