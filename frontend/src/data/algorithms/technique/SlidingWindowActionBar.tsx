import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import Select from "@/shared/components/Select";
import { toast } from "@/shared/components/Toast";
import type {
  AlgoActionBarProps,
  AlgorithmViewMode,
  SlidingWindowMode,
} from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  DataRow,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

const DEFAULT_SLIDING_MODE: SlidingWindowMode = "longest_lte";

function toSlidingWindowMode(
  viewMode: AlgorithmViewMode | undefined,
): SlidingWindowMode {
  if (viewMode === "longest_lte" || viewMode === "shortest_gte") {
    return viewMode;
  }
  return DEFAULT_SLIDING_MODE;
}

export const SlidingWindowActionBar: React.FC<AlgoActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  disabled = false,
  onRun,
  maxNodes,
  viewMode,
  onViewModeChange,
}) => {
  const [targetSum, setTargetSum] = useState<string>("20");

  const currentMode = toSlidingWindowMode(viewMode);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === "longest_lte" || v === "shortest_gte") {
      onViewModeChange?.(v);
    }
  };

  const handleRun = () => {
    const val = parseInt(targetSum, 10);
    if (!isNaN(val)) {
      onRun({ type: "slidingWindow", mode: currentMode, targetSum: val });
    } else {
      toast.warning("請輸入有效的目標和數值");
    }
  };

  return (
    <ActionBarContainer>
      <ActionBarGroup>
        <DataRow
          onLoadData={onLoadData}
          onResetData={onResetData}
          onRandomData={onRandomData}
          onMaxNodesChange={onMaxNodesChange}
          disabled={disabled}
          maxNodes={maxNodes}
        />
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>Sliding Window Control</StaticLabel>
        <div className={styles.viewModeContainer}>
          <span className={styles.viewModeLabel}>模式:</span>
          <Select
            value={currentMode}
            onChange={handleModeChange}
            disabled={disabled}
            size="sm"
            fullWidth={false}
            className={styles.viewModeSelect}
            options={[
              { value: "longest_lte", label: "最長區間 (Sum ≤ Target)" },
              { value: "shortest_gte", label: "最短區間 (Sum ≥ Target)" },
            ]}
            aria-label="Window mode"
          />
        </div>
        <Input
          type="number"
          placeholder="目標和"
          value={targetSum}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTargetSum(e.target.value)
          }
          className={`${styles.input} ${styles.valueInput}`}
          disabled={disabled}
          fullWidth={false}
          aria-label="Target sum"
        />
        <Tooltip content="執行滑動視窗演算法演示">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRun}
            disabled={disabled}
            className={styles.btnRun}
            icon="play"
          >
            開始演示
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
