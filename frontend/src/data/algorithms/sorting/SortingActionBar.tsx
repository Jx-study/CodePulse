import React from "react";
import Button from "@/shared/components/Button";
import type { AlgoActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  DataRow,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const SortingActionBar: React.FC<AlgoActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  onLimitExceeded,
  disabled = false,
  onRun,
}) => {
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
        />
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>Sorting Control</StaticLabel>
        <Button
          size="sm"
          onClick={() => onRun()}
          disabled={disabled}
          className={`${styles.runButton} ${styles.runButtonSorting}`}
        >
          開始排序
        </Button>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
