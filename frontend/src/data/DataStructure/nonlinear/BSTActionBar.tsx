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

export const BSTActionBar: React.FC<DSActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  onLimitExceeded,
  disabled = false,
  onAddNode,
  onDeleteNode,
  onSearchNode,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const handleInsert = () => {
    if (disabled) return;
    const val = Number(inputValue);
    if (!isNaN(val)) {
      onAddNode(val, "Insert");
      setInputValue("");
    }
  };

  const handleDelete = () => {
    if (disabled) return;
    const val = Number(inputValue);
    if (!isNaN(val)) {
      onDeleteNode("DeleteValue", val);
      setInputValue("");
    } else {
      alert("請輸入要刪除的數值");
    }
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
        <StaticLabel>Binary Search Tree Operations</StaticLabel>

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

        <Tooltip content="將數值插入 BST">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleInsert}
            disabled={disabled}
            className={styles.btnInsert}
            icon="plus"
          >
            Insert
          </Button>
        </Tooltip>

        <Tooltip content="從 BST 中刪除指定數值">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleDelete}
            disabled={disabled}
            className={styles.btnDelete}
            icon="trash"
          >
            Delete
          </Button>
        </Tooltip>

        <Input
          type="number"
          placeholder="搜尋值"
          value={searchValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchValue(e.target.value)
          }
          className={styles.input}
          disabled={disabled}
          fullWidth={false}
          aria-label="Search value"
        />
        <Tooltip content="在 BST 中搜尋指定數值">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const val = Number(searchValue);
              onSearchNode(val, "search");
            }}
            disabled={disabled}
            className={styles.btnSearch}
            icon="search"
          >
            Search
          </Button>
        </Tooltip>

        <Tooltip content="找到 BST 中的最小值">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSearchNode(0, "min")}
            disabled={disabled}
            className={styles.btnQuery}
          >
            Min
          </Button>
        </Tooltip>
        <Tooltip content="找到 BST 中的最大值">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSearchNode(0, "max")}
            disabled={disabled}
            className={styles.btnQuery}
          >
            Max
          </Button>
        </Tooltip>
        <Tooltip content="找到不大於指定值的最大數">
          <Button
            size="sm"
            onClick={() => {
              const val = Number(searchValue);
              if (!isNaN(val)) onSearchNode(val, "floor");
              else alert("Floor 需要輸入參考數值");
            }}
            disabled={disabled}
            className={styles.btnQuery}
          >
            Floor
          </Button>
        </Tooltip>
        <Tooltip content="找到不小於指定值的最小數">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const val = Number(searchValue);
              if (!isNaN(val)) onSearchNode(val, "ceil");
              else alert("Ceil 需要輸入參考數值");
            }}
            disabled={disabled}
            className={styles.btnQuery}
          >
            Ceil
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
