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

export const KnapsackActionBar: React.FC<AlgoActionBarProps> = ({
  onLoadData,
  onResetData,
  disabled = false,
  onRun,
}) => {
  const [capacity, setCapacity] = useState("5");

  // 客製化的隨機物品產生器 (因為背包問題需要 weight 和 value 兩個屬性)
  const handleGenerateRandom = () => {
    const itemCount = Math.floor(Math.random() * 4) + 3; // 隨機 3~6 個物品
    const newItems = Array.from({ length: itemCount }, () => ({
      weight: Math.floor(Math.random() * 4) + 1, // 重量 1~4
      value: Math.floor(Math.random() * 40) + 10, // 價值 10~49
    }));

    // 利用 onLoadData 將物件陣列強行載入給 useAlgorithmLogic
    onLoadData(newItems as any);
  };

  const handleRun = () => {
    const cap = parseInt(capacity);
    if (!isNaN(cap) && cap > 0) {
      if (cap > 15) {
        toast.warning("為了維持最佳的視覺化排版，建議背包容量設定在 15 以內");
        return;
      }
      // 將 capacity 參數傳給底層演算法
      onRun({ capacity: cap });
    } else {
      toast.warning("請輸入有效的背包容量 (大於 0 的整數)");
    }
  };

  return (
    <ActionBarContainer>
      {/* 第一區塊：資料生成 */}
      <ActionBarGroup>
        <Tooltip content="清除所有資料，恢復預設物品">
          <Button size="sm" onClick={onResetData} disabled={disabled}>
            重設物品
          </Button>
        </Tooltip>
        <Tooltip content="隨機生成 3~6 個物品 (包含重量與價值)">
          <Button size="sm" onClick={handleGenerateRandom} disabled={disabled}>
            隨機物品
          </Button>
        </Tooltip>
      </ActionBarGroup>

      {/* 第二區塊：演算法控制 */}
      <ActionBarGroup>
        <StaticLabel>Knapsack Control</StaticLabel>
        <Input
          type="number"
          placeholder="背包容量 (W)"
          value={capacity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCapacity(e.target.value)
          }
          className={styles.input}
          disabled={disabled}
          fullWidth={false}
          min={1}
          max={15}
          aria-label="Knapsack capacity"
        />
        <Tooltip content="執行 0/1 背包演算法填表">
          <Button
            size="sm"
            onClick={handleRun}
            disabled={disabled}
            className={`${styles.runButton} ${styles.runButtonSearching}`}
            icon="play"
          >
            開始填表
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
