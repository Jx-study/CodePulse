import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import type { AlgoActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const FibonacciDPActionBar: React.FC<AlgoActionBarProps> = ({
  disabled = false,
  onRun,
}) => {
  const [nValue, setNValue] = useState("6");

  const handleRun = () => {
    if (disabled || !onRun) return;
    const n = parseInt(nValue, 10);
    // 限定 N 在 1 到 12 之間
    if (!isNaN(n) && n >= 1 && n <= 12) {
      onRun({ type: "fibonacciDP", n });
    } else {
      alert("請輸入 1 到 12 之間的數字");
    }
  };

  return (
    <ActionBarContainer>
      <ActionBarGroup>
        <StaticLabel>Fibonacci DP</StaticLabel>
        <Input
          type="number"
          placeholder="輸入 N (1-12)"
          value={nValue}
          min={1}
          max={12}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNValue(e.target.value)
          }
          className={`${styles.input} ${styles.valueInput}`}
          disabled={disabled}
          fullWidth={false}
          aria-label="Input N for Fibonacci"
        />
        <Button
          size="sm"
          variant="primary"
          onClick={handleRun}
          disabled={disabled}
          icon="play"
        >
          Run DP
        </Button>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
