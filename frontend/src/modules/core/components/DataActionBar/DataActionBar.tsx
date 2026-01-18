import React, { useState } from "react";
import Button from "../../../../shared/components/Button/Button";
import styles from "./DataActionBar.module.scss";

export interface DataActionBarProps {
  // 基本操作
  onAddNode: (value: number, mode: string, index?: number) => void;
  onDeleteNode: (mode: string, index?: number) => void;
  onSearchNode: (value: number) => void;

  // 資料管理
  onLoadData: (data: string) => void;
  onResetData: () => void;
  onRandomData: () => void;

  // 設置
  onMaxNodesChange: (max: number) => void;
  onTailModeChange: (hasTail: boolean) => void;

  disabled?: boolean;
}

export const DataActionBar: React.FC<DataActionBarProps> = ({
  onAddNode,
  onDeleteNode,
  onSearchNode,
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  onTailModeChange,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState<string>(""); // 節點數值
  const [indexValue, setIndexValue] = useState<string>(""); // N (索引)
  const [bulkInput, setBulkInput] = useState<string>(""); // 10,20,30...
  const [insertMode, setInsertMode] = useState<string>("Head"); // Head, Tail, Node N
  const [maxNodes, setMaxNodes] = useState<number>(15);

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

  return (
    <div
      className={styles.dataActionBarContainer}
      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
    >
      {/* 第一行：資料控制 (DataManager) */}
      <div className={styles.actionGroup}>
        <input
          type="text"
          placeholder="10,40,30..."
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          className={styles.input}
          style={{ width: "150px" }}
          disabled={disabled}
        />
        <Button
          size="sm"
          onClick={() => onLoadData(bulkInput)}
          disabled={disabled}
        >
          載入資料
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onResetData}
          disabled={disabled}
        >
          重設
        </Button>
        <Button size="sm" onClick={onRandomData} disabled={disabled}>
          隨機
        </Button>

        <div className={styles.settingItem}>
          <label style={{ color: "#ccc", fontSize: "12px" }}>最大筆數: </label>
          <input
            type="number"
            value={maxNodes}
            onChange={(e) => {
              const v = Number(e.target.value);
              setMaxNodes(v);
              onMaxNodesChange(v);
            }}
            style={{
              width: "50px",
              background: "#222",
              color: "#fff",
              border: "1px solid #555",
            }}
            disabled={disabled}
          />
        </div>

        <select
          onChange={(e) => onTailModeChange(e.target.value === "hasTail")}
          className={styles.select}
          disabled={disabled}
        >
          <option value="noTail">無 tail 模式</option>
          <option value="hasTail">有 tail 模式</option>
        </select>
      </div>

      {/* 第二行：操作控制 (OperationManager) */}
      <div className={styles.actionGroup}>
        <select
          value={insertMode}
          onChange={(e) => setInsertMode(e.target.value)}
          className={styles.select}
          disabled={disabled}
        >
          <option value="Head">Head</option>
          <option value="Tail">Tail</option>
          <option value="Node N">Node N</option>
        </select>

        <input
          type="number"
          placeholder="數值"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={styles.input}
          style={{ width: "80px" }}
          disabled={disabled}
        />

        {insertMode === "Node N" && (
          <input
            type="number"
            placeholder="N"
            value={indexValue}
            onChange={(e) => setIndexValue(e.target.value)}
            className={styles.input}
            style={{ width: "50px" }}
            disabled={disabled}
          />
        )}

        <Button size="sm" onClick={handleAdd} disabled={disabled}>
          Insert
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          disabled={disabled}
        >
          Delete
        </Button>

        <div
          style={{
            marginLeft: "12px",
            borderLeft: "1px solid #555",
            paddingLeft: "12px",
            display: "flex",
            gap: "8px",
          }}
        >
          <input
            type="number"
            placeholder="搜尋值"
            id="searchVal"
            className={styles.input}
            style={{ width: "80px" }}
            disabled={disabled}
          />
          <Button
            size="sm"
            onClick={() => {
              const val = Number(
                (document.getElementById("searchVal") as HTMLInputElement).value
              );
              onSearchNode(val);
            }}
            disabled={disabled}
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataActionBar;
