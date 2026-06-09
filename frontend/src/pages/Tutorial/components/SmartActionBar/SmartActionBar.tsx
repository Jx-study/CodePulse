import React from "react";
import { useTranslation } from "react-i18next";
import type {
  LevelImplementationConfig,
  RunParams,
} from "@/types/implementation";

interface SmartActionBarProps {
  // 關卡配置
  topicTypeConfig: LevelImplementationConfig | null;

  // 通用操作 (兩個 ActionBar 都需要)
  onLoadData: (data: string) => void;
  onRandomData: () => void;
  onResetData: () => void;
  disabled?: boolean;

  // 演算法特定
  onRun?: (params?: RunParams) => void;
  viewMode?: string;
  onViewModeChange?: (mode: string) => void;
  currentData?: any;

  // 資料結構特定
  onAddNode?: (value: number, mode: string, index?: number) => void;
  onDeleteNode?: (mode: string, index?: number) => void;
  onSearchNode?: (value: number, mode?: string) => void;
  onPeek?: () => void;
  onMaxNodesChange?: (max: number) => void;
  onTailModeChange?: (hasTail: boolean) => void;
  onCustomAction?: (action: string, payload: any) => void;

  // Graph 特定
  onGraphAction?: (action: string, payload: any) => void;
  isDirected?: boolean;
  onIsDirectedChange?: (val: boolean) => void;
}

export const SmartActionBar: React.FC<SmartActionBarProps> = (props) => {
  const { topicTypeConfig, ...restProps } = props;
  const { t } = useTranslation("tutorial");

  if (!topicTypeConfig) {
    return <div>{t("common.loading")}</div>;
  }

  if (topicTypeConfig.renderActionBar) {
    return <>{topicTypeConfig.renderActionBar(restProps as any)}</>;
  }

  return <div>{t("smartActionBar.noInterface")}</div>;
};
