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

export const FibonacciActionBar: React.FC<AlgoActionBarProps> = ({
  disabled = false,
  onRun,
}) => {
  const [nValue, setNValue] = useState("4");

  const handleRun = () => {
    if (disabled || !onRun) return;
    const n = parseInt(nValue, 10);
    // fib(6) 有 25 個節點
    if (!isNaN(n) && n >= 1 && n <= 6) {
      onRun({ type: "fibonacciRecursive", n });
    } else {
      alert("請輸入 1 到 6 之間的數字 (遞迴樹膨脹很快)");
    }
  };

  return (
    <ActionBarContainer>
      <ActionBarGroup>
        <StaticLabel>Fibonacci Recursive</StaticLabel>
        <Input
          type="number"
          placeholder="輸入 N (1-6)"
          value={nValue}
          min={1}
          max={6}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNValue(e.target.value)
          }
          className={`${styles.input} ${styles.valueInput}`}
          disabled={disabled}
          fullWidth={false}
          aria-label="Input N for Fibonacci Recursive"
        />
        <Button
          size="sm"
          variant="primary"
          onClick={handleRun}
          disabled={disabled}
          icon="play"
        >
          Run Recursion
        </Button>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
