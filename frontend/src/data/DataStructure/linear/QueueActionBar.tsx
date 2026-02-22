import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import type { DSActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  DataRow,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const QueueActionBar: React.FC<DSActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  onLimitExceeded,
  disabled = false,
  onAddNode,
  onDeleteNode,
  onPeek,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleEnqueue = () => {
    if (disabled) return;
    const val = Number(inputValue);
    if (!isNaN(val)) {
      onAddNode(val, "Tail");
      setInputValue("");
    }
  };

  const handleDequeue = () => {
    if (disabled) return;
    onDeleteNode("Head");
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
        <StaticLabel>Queue Operations</StaticLabel>

        <Input
          type="number"
          placeholder="數值"
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(e.target.value)
          }
          className={styles.input}
          disabled={disabled}
          fullWidth={false}
          aria-label="Node value"
        />

        <Button
          size="sm"
          variant="secondary"
          onClick={handleEnqueue}
          disabled={disabled}
          className={styles.btnInsert}
          icon="plus"
        >
          Enqueue
        </Button>

        <Button
          size="sm"
          variant="secondary"
          onClick={handleDequeue}
          disabled={disabled}
          className={styles.btnDelete}
          icon="trash"
        >
          Dequeue
        </Button>

        {onPeek && (
          <Button
            size="sm"
            onClick={onPeek}
            disabled={disabled}
            className={styles.btnQuery}
            icon="eye"
          >
            Peek
          </Button>
        )}
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
