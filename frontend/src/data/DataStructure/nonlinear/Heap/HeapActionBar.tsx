import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import type { DSActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  DataRow,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const HeapActionBar: React.FC<DSActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  maxNodes,
  disabled = false,
  onCustomAction,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isMinHeap, setIsMinHeap] = useState(false);
  const [isMaxHeap, setIsMaxHeap] = useState(true);

  const isHeapReady = isMinHeap || isMaxHeap;
  const heapLabel = isMinHeap
    ? "Min-Heap"
    : isMaxHeap
      ? "Max-Heap"
      : "Not Heap";

  const markMaxHeap = () => {
    setIsMinHeap(false);
    setIsMaxHeap(true);
  };

  const markNotHeap = () => {
    setIsMinHeap(false);
    setIsMaxHeap(false);
  };

  const handleLoadData = (data: string) => {
    markNotHeap();
    onLoadData(data);
  };

  const handleResetData = () => {
    markMaxHeap();
    onResetData();
  };

  const handleRandomData = (params?: any) => {
    markNotHeap();
    onRandomData(params);
  };

  const handleToggleMode = () => {
    if (disabled || !onCustomAction) return;
    const newMode = !isMinHeap;
    setIsMinHeap(newMode);
    setIsMaxHeap(!newMode);
    // 切換模式時，自動觸發一次 Heapify 重新建堆！
    onCustomAction("heapify", { isMinHeap: newMode, isMaxHeap: !newMode });
  };

  const handleInsert = () => {
    if (disabled || !inputValue || !onCustomAction || !isHeapReady) return;
    const val = parseInt(inputValue, 10);
    if (!isNaN(val)) {
      onCustomAction("add", { value: val, isMinHeap, isMaxHeap });
      setInputValue("");
    }
  };

  const handleExtract = () => {
    if (disabled || !onCustomAction || !isHeapReady) return;
    onCustomAction("delete", { isMinHeap, isMaxHeap });
  };

  const handlePeek = () => {
    if (disabled || !onCustomAction || !isHeapReady) return;
    onCustomAction("peek", { isMinHeap, isMaxHeap });
  };

  const handleHeapify = () => {
    if (disabled || !onCustomAction) return;
    setIsMaxHeap(!isMinHeap);
    onCustomAction("heapify", { isMinHeap, isMaxHeap: !isMinHeap });
  };

  return (
    <ActionBarContainer>
      <ActionBarGroup>
        <DataRow
          onLoadData={handleLoadData}
          onResetData={handleResetData}
          onRandomData={handleRandomData}
          onMaxNodesChange={onMaxNodesChange}
          disabled={disabled}
          maxNodes={maxNodes}
        />
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>{heapLabel}</StaticLabel>

        <Tooltip content="切換 Heap 模式並自動重新建堆">
          <Button
            size="sm"
            variant="secondary"
            className={isMinHeap ? styles.btnToggleOn : styles.btnToggleOff}
            onClick={handleToggleMode}
            disabled={disabled}
            icon="rotate"
          >
            {isHeapReady
              ? `切換至 ${isMinHeap ? "Max" : "Min"}`
              : "建 Min-Heap"}
          </Button>
        </Tooltip>

        <Input
          type="number"
          placeholder="輸入數字"
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(e.target.value)
          }
          className={`${styles.input} ${styles.valueInput}`}
          disabled={disabled}
          fullWidth={false}
          onKeyDown={(e) => e.key === "Enter" && handleInsert()}
        />
        <Tooltip
          content={
            isHeapReady
              ? "將數值新增至 Heap (Heapify Up)"
              : "請先 Heapify，將資料轉成 Max-Heap 或 Min-Heap"
          }
        >
          <Button
            size="sm"
            variant="secondary"
            className={styles.btnInsert}
            onClick={handleInsert}
            disabled={disabled || !inputValue || !isHeapReady}
            icon="plus"
          >
            Insert
          </Button>
        </Tooltip>

        <Tooltip
          content={
            isHeapReady
              ? `取出並移除${isMinHeap ? "最小" : "最大"}值 (Heapify Down)`
              : "請先 Heapify，才能取出 Heap 的根節點"
          }
        >
          <Button
            size="sm"
            variant="secondary"
            className={styles.btnDelete}
            onClick={handleExtract}
            disabled={disabled || !isHeapReady}
            icon="arrow-up-from-bracket"
          >
            {isHeapReady
              ? `Extract ${isMinHeap ? "Min" : "Max"}`
              : "Extract"}
          </Button>
        </Tooltip>

        <Tooltip
          content={
            isHeapReady
              ? `僅查看${isMinHeap ? "最小" : "最大"}值 (不移除)`
              : "請先 Heapify，才能查看 Heap 的根節點"
          }
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={handlePeek}
            disabled={disabled || !isHeapReady}
            icon="eye"
          >
            Peek
          </Button>
        </Tooltip>

        <Tooltip content="將無序陣列轉換為 Heap (Bottom-Up 建堆)">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleHeapify}
            disabled={disabled}
            icon="wand-magic-sparkles"
          >
            Heapify
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
