import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import {
  ActionBarContainer,
  ActionBarGroup,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";
import type { AlgoActionBarProps } from "@/types/implementation";

export const FactorialActionBar: React.FC<AlgoActionBarProps> = ({
  disabled = false,
  onRun,
}) => {
  const [nValue, setNValue] = useState("5");

  const handleRun = () => {
    if (disabled) return;
    const n = parseInt(nValue, 10);
    if (!isNaN(n)) {
      // 利用 onRun 傳遞自訂的 payload (n)
      onRun({ type: "factorial", n });
    }
  };

  return (
    <ActionBarContainer>
      <ActionBarGroup>
        <StaticLabel>階乘 (N!)</StaticLabel>
        <Input
          type="number"
          placeholder="輸入 N (1-10)"
          value={nValue}
          onChange={(e) => setNValue(e.target.value)}
          className={`${styles.input} ${styles.valueInput}`}
          disabled={disabled}
          min={1}
          max={10}
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={handleRun}
          disabled={disabled || !nValue}
          icon="play"
        >
          執行遞迴
        </Button>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
