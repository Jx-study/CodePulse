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

  const handleToggleMode = () => {
    if (disabled || !onCustomAction) return;
    const newMode = !isMinHeap;
    setIsMinHeap(newMode);
    // 切換模式時，自動觸發一次 Heapify 重新建堆！
    onCustomAction("heapify", { isMinHeap: newMode });
  };

  const handleInsert = () => {
    if (disabled || !inputValue || !onCustomAction) return;
    const val = parseInt(inputValue, 10);
    if (!isNaN(val)) {
      onCustomAction("add", { value: val, isMinHeap });
      setInputValue("");
    }
  };

  const handleExtract = () => {
    if (disabled || !onCustomAction) return;
    onCustomAction("delete", { isMinHeap });
  };

  const handlePeek = () => {
    if (disabled || !onCustomAction) return;
    onCustomAction("peek", { isMinHeap });
  };

  const handleHeapify = () => {
    if (disabled || !onCustomAction) return;
    onCustomAction("heapify", { isMinHeap });
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
        <StaticLabel>{isMinHeap ? "Min-Heap" : "Max-Heap"}</StaticLabel>

        <Tooltip content="切換 Heap 模式並自動重新建堆">
          <Button
            size="sm"
            variant={isMinHeap ? "secondary" : "primary"}
            onClick={handleToggleMode}
            disabled={disabled}
            icon="rotate"
          >
            切換至 {isMinHeap ? "Max" : "Min"}
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
        <Tooltip content="將數值新增至 Heap (Heapify Up)">
          <Button
            size="sm"
            variant="primary"
            onClick={handleInsert}
            disabled={disabled || !inputValue}
            icon="plus"
          >
            Insert
          </Button>
        </Tooltip>

        <Tooltip
          content={`取出並移除${isMinHeap ? "最小" : "最大"}值 (Heapify Down)`}
        >
          <Button
            size="sm"
            variant="danger"
            onClick={handleExtract}
            disabled={disabled}
            icon="arrow-up-from-bracket"
          >
            Extract {isMinHeap ? "Min" : "Max"}
          </Button>
        </Tooltip>

        <Tooltip content={`僅查看${isMinHeap ? "最小" : "最大"}值 (不移除)`}>
          <Button
            size="sm"
            variant="secondary"
            onClick={handlePeek}
            disabled={disabled}
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
