import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import { toast } from "@/shared/components/Toast";
import type { DSActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  DataRow,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const ArrayActionBar: React.FC<DSActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  disabled = false,
  onAddNode,
  onDeleteNode,
  onSearchNode,
  maxNodes,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [indexValue, setIndexValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const handleInsert = () => {
    if (disabled) return;
    if (inputValue.trim() === "") {
      toast.warning("請輸入要插入的數值");
      return;
    }
    const val = Number(inputValue);
    const idx = indexValue.trim() !== "" ? Number(indexValue) : undefined;
    onAddNode(val, "Insert", idx);
  };

  const handleUpdate = () => {
    if (disabled) return;
    if (inputValue.trim() === "") {
      toast.warning("Update 需要輸入數值與索引");
      return;
    }
    const val = Number(inputValue);
    const idx = indexValue.trim() !== "" ? Number(indexValue) : undefined;
    if (idx !== undefined) {
      onAddNode(val, "Update", idx);
    } else {
      toast.warning("Update 需要輸入數值與索引");
    }
  };

  const handleDelete = () => {
    if (disabled) return;
    if (indexValue.trim() === "") {
      toast.warning("請輸入要刪除的索引");
      return;
    }
    const idx = Number(indexValue);
    onDeleteNode("Insert", idx);
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
        <StaticLabel>Array Operations</StaticLabel>

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

        <Tooltip content="在指定索引位置插入元素">
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

        <Tooltip content="更新指定索引位置的元素值">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleUpdate}
            disabled={disabled}
            className={styles.btnUpdate}
            icon="pencil"
          >
            Update
          </Button>
        </Tooltip>

        <Tooltip content="刪除指定索引位置的元素">
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
        <Tooltip content="搜尋陣列中的指定數值">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              if (searchValue.trim() === "") {
                toast.warning("請輸入搜尋值");
                return;
              }
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
