import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import type { AlgoActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  DataRow,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const PrefixSumActionBar: React.FC<AlgoActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  onLimitExceeded,
  disabled = false,
  onRun,
}) => {
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  const handleRun = () => {
    const start = parseInt(rangeStart);
    const end = parseInt(rangeEnd);

    if (isNaN(start) && isNaN(end)) {
      onRun({});
    } else if (
      !isNaN(start) &&
      !isNaN(end) &&
      start <= end &&
      start >= 0 &&
      end >= 0
    ) {
      onRun({ range: [start, end] });
    } else {
      alert("請輸入完整的區間 (Start, End)");
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
        />
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>Prefix Sum Control</StaticLabel>
        <div className={styles.rangeInput}>
          <Input
            type="number"
            placeholder="L"
            value={rangeStart}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRangeStart(e.target.value)
            }
            className={styles.input}
            disabled={disabled}
            fullWidth={false}
            aria-label="Range start"
          />
          <StaticLabel>-</StaticLabel>
          <Input
            type="number"
            placeholder="R"
            value={rangeEnd}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRangeEnd(e.target.value)
            }
            className={styles.input}
            disabled={disabled}
            fullWidth={false}
            aria-label="Range end"
          />
        </div>
        <Button
          size="sm"
          onClick={handleRun}
          disabled={disabled}
          className={`${styles.runButton} ${styles.runButtonTechnique}`}
        >
          開始演示
        </Button>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
