import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import { toast } from "@/shared/components/Toast";
import type { AlgoActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const NQueensActionBar: React.FC<AlgoActionBarProps> = ({
  onResetData,
  disabled = false,
  onRun,
}) => {
  // 預設為 4 皇后 (動畫長度適中)
  const [nSize, setNSize] = useState("4");

  const handleRun = () => {
    const n = parseInt(nSize);
    if (!isNaN(n) && n >= 1) {
      if (n > 8) {
        toast.warning("N 大於 8 時運算與動畫時間過長，請輸入 1~8 之間的數字。");
        return;
      }
      // 將 N 參數傳給底層演算法
      onRun({ nQueensCount: n });
    } else {
      toast.warning("請輸入有效的棋盤大小 N (大於 0 的整數)");
    }
  };

  return (
    <ActionBarContainer>
      {/* 執行控制 */}
      <ActionBarGroup>
        <StaticLabel>N-Queens Control</StaticLabel>
        <Input
          type="number"
          placeholder="棋盤大小 N"
          value={nSize}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNSize(e.target.value)
          }
          className={styles.input}
          disabled={disabled}
          fullWidth={false}
          min={1}
          max={8}
          aria-label="Board size N"
        />
        <Tooltip content="執行 N 皇后回溯演算法">
          <Button
            size="sm"
            onClick={handleRun}
            disabled={disabled}
            className={`${styles.runButton} ${styles.runButtonSearching}`}
            icon="play"
          >
            開始解題
          </Button>
        </Tooltip>
        <Tooltip content="重設棋盤狀態">
          <Button
            size="sm"
            variant="secondary"
            onClick={onResetData}
            disabled={disabled}
            icon="rotate-right"
          >
            重設
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
