import React from "react";
import { AlgorithmActionBar } from "@/modules/core/components/AlgorithmActionBar/AlgorithmActionBar";
import { DataActionBar, StructureType } from "@/modules/core/components/DataActionBar/DataActionBar";
import type { LevelImplementationConfig } from "@/types/implementation";

interface SmartActionBarProps {
  // 關卡配置
  topicTypeConfig: LevelImplementationConfig | null;
  category?: string;

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
  const { topicTypeConfig, category, ...restProps } = props;

  if (!topicTypeConfig) {
    return <div>載入中...</div>;
  }

  // 演算法類型
  if (topicTypeConfig.type === "algorithm") {
    return (
      <AlgorithmActionBar
        onLoadData={restProps.onLoadData}
        onRandomData={restProps.onRandomData}
        onResetData={restProps.onResetData}
        onRun={restProps.onRun!}
        onRandomCountChange={restProps.onMaxNodesChange}
        onLimitExceeded={restProps.onLimitExceeded}
        disabled={restProps.disabled}
        category={category}
        algorithmId={topicTypeConfig.id}
        viewMode={restProps.viewMode || "graph"}
        onViewModeChange={restProps.onViewModeChange!}
        currentData={restProps.currentData}
      />
    );
  }

  // 資料結構類型
  if (topicTypeConfig.type === "dataStructure") {
    const validStructureTypes = [
      "linkedlist", "stack", "queue", "array", "binarytree", "bst", "graph"
    ];

    if (validStructureTypes.includes(topicTypeConfig.id)) {
      return (
        <DataActionBar
          onAddNode={restProps.onAddNode!}
          onDeleteNode={restProps.onDeleteNode!}
          onSearchNode={restProps.onSearchNode!}
          onPeek={restProps.onPeek}
          onGraphAction={restProps.onGraphAction}
          onLoadData={restProps.onLoadData}
          onResetData={restProps.onResetData}
          onRandomData={restProps.onRandomData}
          onRandomCountChange={restProps.onMaxNodesChange!}
          onTailModeChange={restProps.onTailModeChange!}
          structureType={topicTypeConfig.id as StructureType}
          disabled={restProps.disabled}
          isDirected={restProps.isDirected}
          onIsDirectedChange={restProps.onIsDirectedChange}
          onLimitExceeded={restProps.onLimitExceeded}
        />
      );
    }
  }

  return <div>此主題暫無操作介面</div>;
};
