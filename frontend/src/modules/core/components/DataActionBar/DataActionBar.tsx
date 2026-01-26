import React, { useState, useEffect } from "react";
import Button from "../../../../shared/components/Button/Button";
import styles from "./DataActionBar.module.scss";

// 定義支援的結構類型
export type StructureType =
  | "linkedlist"
  | "stack"
  | "queue"
  | "array"
  | "binarytree";

export interface DataActionBarProps {
  // 基本操作
  onAddNode: (value: number, mode: string, index?: number) => void;
  onDeleteNode: (mode: string, index?: number) => void;
  onSearchNode: (value: number) => void;
  onPeek?: () => void;

  // 資料管理
  onLoadData: (data: string) => void;
  onResetData: () => void;
  onRandomData: () => void;

  // 設置
  onMaxNodesChange: (max: number) => void;
  onTailModeChange: (hasTail: boolean) => void;

  disabled?: boolean;
  structureType: StructureType;
}

export const DataActionBar: React.FC<DataActionBarProps> = ({
  onAddNode,
  onDeleteNode,
  onSearchNode,
  onPeek,
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  onTailModeChange,
  disabled = false,
  structureType,
}) => {
  const [inputValue, setInputValue] = useState<string>(""); // 節點數值
  const [indexValue, setIndexValue] = useState<string>(""); // N (索引)
  const [bulkInput, setBulkInput] = useState<string>(""); // 10,20,30...
  const [insertMode, setInsertMode] = useState<string>("Head"); // Head, Tail, Node N
  const [maxNodes, setMaxNodes] = useState<number>(10);

  // init
  useEffect(() => {
    if (structureType === "stack") setInsertMode("Push");
    else if (structureType === "queue") setInsertMode("Enqueue");
    else if (structureType === "array") setInsertMode("Insert");
    else setInsertMode("Head");
  }, [structureType]);

  const handleAdd = () => {
    if (disabled) return;
    const val = Number(inputValue);
    const idx = indexValue !== "" ? Number(indexValue) : undefined;
    if (!isNaN(val)) {
      onAddNode(val, insertMode, idx);
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
    onDeleteNode(insertMode, idx);
  };

  // 判斷是否顯示某些控制項
  const showIndexInput =
    (structureType === "linkedlist" && insertMode === "Node N") ||
    structureType === "array";
  const showTailMode = structureType === "linkedlist";
  const showSearchMode =
    structureType === "linkedlist" || structureType === "array";
  const showPeek = structureType === "stack" || structureType === "queue";
  const showUpdateButton = structureType === "array";
  const isBinaryTree = structureType === "binarytree";

  // 判斷操作選項
  const getModeOptions = () => {
    if (structureType === "stack") {
      return [
        <option key="push" value="Head">
          Push
        </option>, // value 傳 Head 是因為 Hook 裡的邏輯，或者也可以在 Hook 裡改成接 Push
      ];
    }
    if (structureType === "queue") {
      return [
        <option key="enqueue" value="Tail">
          Enqueue
        </option>,
      ];
    }
    if (structureType === "array") {
      return null;
    }
    // Default: Linked List
    return [
      <option key="head" value="Head">
        Head
      </option>,
      <option key="tail" value="Tail">
        Tail
      </option>,
      <option key="n" value="Node N">
        Node N
      </option>,
    ];
  };

  // 按鈕文字動態化
  let addBtnText = "Insert";
  if (structureType === "stack") addBtnText = "Push";
  else if (structureType === "queue") addBtnText = "Enqueue";
  else if (structureType === "array") addBtnText = "Insert";

  let delBtnText = "Delete";
  if (structureType === "stack") delBtnText = "Pop";
  else if (structureType === "queue") delBtnText = "Dequeue";

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
        <Button size="sm" onClick={onResetData} disabled={disabled}>
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

        {showTailMode && (
          <select
            onChange={(e) => onTailModeChange(e.target.value === "hasTail")}
            className={styles.select}
            disabled={disabled}
          >
            <option value="noTail">無 tail 模式</option>
            <option value="hasTail">有 tail 模式</option>
          </select>
        )}
      </div>
      {/* 第二行：操作控制 (OperationManager) */}
      {!isBinaryTree && (
        <div className={styles.actionGroup}>
          {/* 標籤顯示 */}
          <div
            className={styles.staticLabel}
            style={{ color: "#ccc", padding: "0 8px" }}
          >
            {structureType === "array"
              ? "Array Operations"
              : structureType === "linkedlist"
              ? "Linked List Operations"
              : structureType === "stack"
              ? "Stack Operations"
              : "Queue Operations"}
          </div>

          {structureType === "linkedlist" && (
            <select
              value={insertMode}
              onChange={(e) => setInsertMode(e.target.value)}
              className={styles.select}
              disabled={disabled}
            >
              {getModeOptions()}
            </select>
          )}

          <input
            type="number"
            placeholder="數值"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={styles.input}
            style={{ width: "80px" }}
            disabled={disabled}
          />

          {showIndexInput && (
            <input
              type="number"
              placeholder="Index"
              value={indexValue}
              onChange={(e) => setIndexValue(e.target.value)}
              className={styles.input}
              style={{ width: "60px" }}
              disabled={disabled}
            />
          )}

          <Button size="sm" onClick={handleAdd} disabled={disabled}>
            {addBtnText}
          </Button>

          {showUpdateButton && (
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={disabled}
              style={{ marginLeft: "4px" }}
            >
              Update
            </Button>
          )}

          <Button size="sm" onClick={handleDelete} disabled={disabled}>
            {delBtnText}
          </Button>

          {showPeek && onPeek && (
            <Button size="sm" onClick={onPeek} disabled={disabled}>
              Peek
            </Button>
          )}

          {showSearchMode && (
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
                    (document.getElementById("searchVal") as HTMLInputElement)
                      .value
                  );
                  onSearchNode(val);
                }}
                disabled={disabled}
              >
                Search
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataActionBar;
