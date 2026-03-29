import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import Select from "@/shared/components/Select";
import type { DSActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  DataRow,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const LinkedListActionBar: React.FC<DSActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  disabled = false,
  onAddNode,
  onDeleteNode,
  onSearchNode,
  onTailModeChange,
  onListModeChange,
  maxNodes,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [indexValue, setIndexValue] = useState("");
  const [insertMode, setInsertMode] = useState("Head");
  const [searchValue, setSearchValue] = useState("");
  const [isDoubly, setIsDoubly] = useState<"singly" | "doubly">("singly");

  const showIndexInput = insertMode === "Node N";

  const handleAdd = () => {
    if (disabled) return;
    const val = Number(inputValue);
    const idx = indexValue !== "" ? Number(indexValue) : undefined;
    if (!isNaN(val)) {
      onAddNode(val, insertMode, idx);
      setInputValue("");
    }
  };

  const handleDelete = () => {
    if (disabled) return;
    const idx = indexValue !== "" ? Number(indexValue) : undefined;
    onDeleteNode(insertMode, idx);
  };
  console.log(onListModeChange);
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
        {onListModeChange && (
          <Select
            size="sm"
            value={isDoubly}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const mode = e.target.value as "singly" | "doubly";
              setIsDoubly(mode);
              onListModeChange(mode);
            }}
            className={styles.select}
            disabled={disabled}
            options={[
              { value: "singly", label: "單向 (Singly)" },
              { value: "doubly", label: "雙向 (Doubly)" },
            ]}
            aria-label="List mode selection"
          />
        )}
        {onTailModeChange && (
          <Select
            size="sm"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onTailModeChange(e.target.value === "hasTail")
            }
            className={styles.select}
            disabled={disabled}
            options={[
              { value: "noTail", label: "無 tail 模式" },
              { value: "hasTail", label: "有 tail 模式" },
            ]}
            aria-label="Tail mode selection"
          />
        )}
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>Linked List Operations</StaticLabel>

        <Select
          size="sm"
          value={insertMode}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setInsertMode(e.target.value)
          }
          className={styles.select}
          disabled={disabled}
          options={[
            { value: "Head", label: "Head" },
            { value: "Tail", label: "Tail" },
            { value: "Node N", label: "Node N" },
          ]}
          aria-label="Insert mode"
        />

        <Input
          type="number"
          placeholder="數值"
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(e.target.value)
          }
          className={`${styles.input} ${styles.valueInput}`}
          disabled={disabled}
          fullWidth={false}
          aria-label="Node value"
        />

        {showIndexInput && (
          <Input
            type="number"
            placeholder="Index"
            value={indexValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setIndexValue(e.target.value)
            }
            className={`${styles.input} ${styles.valueInput}`}
            disabled={disabled}
            fullWidth={false}
            aria-label="Index"
          />
        )}

        <Tooltip content="在指定位置新增一個節點">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleAdd}
            disabled={disabled}
            className={styles.btnInsert}
            icon="plus"
          >
            Insert
          </Button>
        </Tooltip>

        <Tooltip content="刪除指定位置的節點">
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
          className={`${styles.input} ${styles.valueInput}`}
          disabled={disabled}
          fullWidth={false}
          aria-label="Search value"
        />
        <Tooltip content="搜尋指定數值的節點">
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
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
