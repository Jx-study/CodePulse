import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import type { AlgoActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  DataRow,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const SlidingWindowActionBar: React.FC<AlgoActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  onLimitExceeded,
  disabled = false,
  onRun,
  maxNodes,
}) => {
  const [windowMode, setWindowMode] = useState<string>("longest_lte");
  const [targetSum, setTargetSum] = useState<string>("20");

  const handleRun = () => {
    const val = parseInt(targetSum, 10);
    if (!isNaN(val)) {
      onRun({ mode: windowMode as any, targetSum: val });
    } else {
      alert("請輸入有效的目標和數值");
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
          onLimitExceeded={onLimitExceeded}
          disabled={disabled}
          maxNodes={maxNodes}
        />
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>Sliding Window Control</StaticLabel>
        <div className={styles.viewModeContainer}>
          <span className={styles.viewModeLabel}>模式:</span>
          <select
            value={windowMode}
            onChange={(e) => setWindowMode(e.target.value)}
            disabled={disabled}
            className={styles.viewModeSelect}
          >
            <option value="longest_lte">最長區間 (Sum &le; Target)</option>
            <option value="shortest_gte">最短區間 (Sum &ge; Target)</option>
          </select>
        </div>
        <Input
          type="number"
          placeholder="目標和"
          value={targetSum}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTargetSum(e.target.value)
          }
          className={styles.input}
          disabled={disabled}
          fullWidth={false}
          aria-label="Target sum"
        />
        <Tooltip content="執行滑動視窗演算法演示">
          <Button
            size="sm"
            onClick={handleRun}
            disabled={disabled}
            className={`${styles.runButton} ${styles.runButtonTechnique}`}
          >
            開始演示
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
