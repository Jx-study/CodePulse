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
  onAddNode,
  onDeleteNode,
  onPeek,
  onGraphAction,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleInsert = () => {
    if (disabled || !inputValue) return;
    const val = parseInt(inputValue, 10);
    if (!isNaN(val)) {
      onAddNode(val, "Insert");
      setInputValue("");
    }
  };

  const handleExtract = () => {
    if (disabled) return;
    onDeleteNode("Extract");
  };

  const handlePeek = () => {
    if (disabled || !onPeek) return;
    onPeek();
  };

  const handleHeapify = () => {
    if (disabled || !onGraphAction) return;
    onGraphAction("heapify", {});
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
        <StaticLabel>Max-Heap</StaticLabel>
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
            onClick={handleInsert}
            disabled={disabled || !inputValue}
            icon="plus"
          >
            Insert
          </Button>
        </Tooltip>

        <Tooltip content="取出並移除最大值 (Heapify Down)">
          <Button size="sm" onClick={handleExtract} disabled={disabled}>
            Extract Max
          </Button>
        </Tooltip>

        <Tooltip content="僅查看最大值 (不移除)">
          <Button size="sm" onClick={handlePeek} disabled={disabled} icon="eye">
            Peek
          </Button>
        </Tooltip>

        <Tooltip content="將無序陣列轉換為 Heap (Bottom-Up 建堆)">
          <Button size="sm" onClick={handleHeapify} disabled={disabled}>
            Heapify
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
