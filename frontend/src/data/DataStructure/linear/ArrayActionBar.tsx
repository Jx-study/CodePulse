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

export const ArrayActionBar: React.FC<DSActionBarProps> = ({
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
  const [indexValue, setIndexValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const handleInsert = () => {
    if (disabled) return;
    const val = Number(inputValue);
    const idx = indexValue !== "" ? Number(indexValue) : undefined;
    if (!isNaN(val)) {
      onAddNode(val, "Insert", idx);
      setInputValue("");
    }
  };

  const handleUpdate = () => {
    if (disabled) return;
    const val = Number(inputValue);
    const idx = indexValue !== "" ? Number(indexValue) : undefined;
    if (!isNaN(val) && idx !== undefined) {
      onAddNode(val, "Update", idx);
      setInputValue("");
    } else {
      alert("Update 需要輸入數值與索引");
    }
  };

  const handleDelete = () => {
    if (disabled) return;
    const idx = indexValue !== "" ? Number(indexValue) : undefined;
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
          onLimitExceeded={onLimitExceeded}
          disabled={disabled}
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
          className={styles.input}
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
          className={styles.input}
          disabled={disabled}
          fullWidth={false}
          aria-label="Index"
        />

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
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
