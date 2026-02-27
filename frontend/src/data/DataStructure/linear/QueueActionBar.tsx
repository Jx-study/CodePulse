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

        <Tooltip content="將元素加入佇列尾部">
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
        </Tooltip>

        <Tooltip content="移除佇列前端的元素">
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
        </Tooltip>

        {onPeek && (
          <Tooltip content="查看佇列前端的元素（不移除）">
            <Button
              size="sm"
              onClick={onPeek}
              disabled={disabled}
              className={styles.btnQuery}
              icon="eye"
            >
              Peek
            </Button>
          </Tooltip>
        )}
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
