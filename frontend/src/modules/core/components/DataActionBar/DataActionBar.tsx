import React, { useState, useEffect } from "react";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import Select from "@/shared/components/Select";
import styles from "./DataActionBar.module.scss";
import Icon from "@/shared/components/Icon";

// 定義支援的結構類型
export type StructureType =
  | "linkedlist"
  | "stack"
  | "queue"
  | "array"
  | "binarytree"
  | "bst";

export interface DataActionBarProps {
  // 基本操作
  onAddNode: (value: number, mode: string, index?: number) => void;
  onDeleteNode: (mode: string, index?: number) => void;
  onSearchNode: (value: number, mode?: string) => void;
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
    else if (structureType === "array" || structureType === "bst")
      setInsertMode("Insert");
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
    if (structureType === "bst") {
      const val = Number(inputValue);
      if (!isNaN(val)) {
        // 用 index 參數傳 value，或者要在上層 Hook 處理
        onDeleteNode("DeleteValue", val);
        setInputValue("");
      } else {
        alert("請輸入要刪除的數值");
      }
    } else {
      const idx = indexValue !== "" ? Number(indexValue) : undefined;
      onDeleteNode(insertMode, idx);
    }
  };

  // 判斷是否顯示某些控制項
  const isBST = structureType === "bst";
  const showIndexInput =
    (structureType === "linkedlist" && insertMode === "Node N") ||
    structureType === "array";
  const showTailMode = structureType === "linkedlist";
  const showSearchMode =
    structureType === "linkedlist" || structureType === "array" || isBST;
  const showPeek = structureType === "stack" || structureType === "queue";
  const showUpdateButton = structureType === "array";
  const isBinaryTree = structureType === "binarytree";

  // 按鈕文字動態化
  let addBtnText = "Insert";
  if (structureType === "stack") addBtnText = "Push";
  else if (structureType === "queue") addBtnText = "Enqueue";
  else if (structureType === "array" || structureType === "bst")
    addBtnText = "Insert";

  let delBtnText = "Delete";
  if (structureType === "stack") delBtnText = "Pop";
  else if (structureType === "queue") delBtnText = "Dequeue";
  else if (structureType === "bst") delBtnText = "Delete";

  return (
    <div
      className={styles.dataActionBarContainer}
      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
    >
      {/* 第一行：資料控制 (DataManager) */}
      <div className={styles.actionGroup}>
        <Input
          type="text"
          placeholder="10,40,30..."
          value={bulkInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setBulkInput(e.target.value)
          }
          className={styles.input}
          disabled={disabled}
          fullWidth={false}
          aria-label="Bulk data input"
        />
        <Button
          size="sm"
          onClick={() => onLoadData(bulkInput)}
          disabled={disabled}
          icon="download"
        >
          載入資料
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onResetData}
          disabled={disabled}
          icon="rotate-right"
        >
          重設
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onRandomData}
          disabled={disabled}
          icon="shuffle"
        >
          隨機
        </Button>

        <div className={styles.settingItem}>
          <label className={styles.staticLabel}>最大筆數: </label>
          <Input
            type="number"
            value={maxNodes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const v = Number(e.target.value);
              setMaxNodes(v);
              onMaxNodesChange(v);
            }}
            className={styles.input}
            disabled={disabled}
            fullWidth={false}
            aria-label="Maximum nodes"
          />
        </div>

        {showTailMode && (
          <Select
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
      </div>
      {/* 第二行：操作控制 (OperationManager) */}

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
                : structureType === "queue"
                  ? "Queue Operations"
                  : structureType === "binarytree"
                    ? "Binary Tree Traversals"
                    : structureType === "bst"
                      ? "Binary Search Tree Operations"
                      : "Operations"}
        </div>
        {isBinaryTree ? (
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onSearchNode(0, "preorder")}
              disabled={disabled}
              className={styles.btnSearch}
            >
              Preorder
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onSearchNode(0, "inorder")}
              disabled={disabled}
              className={styles.btnSearch}
            >
              Inorder
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onSearchNode(0, "postorder")}
              disabled={disabled}
              className={styles.btnSearch}
            >
              Postorder
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onSearchNode(0, "bfs")}
              disabled={disabled}
              className={styles.btnSearch}
            >
              BFS (Level-order)
            </Button>
          </>
        ) : (
          <>
            {structureType === "linkedlist" && (
              <Select
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
            )}

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

            {showIndexInput && (
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
                aria-label="Node index"
              />
            )}

            <Button
              size="sm"
              variant="secondary"
              onClick={handleAdd}
              disabled={disabled}
              className={styles.btnInsert}
              icon="plus"
            >
              {addBtnText}
            </Button>

            {showUpdateButton && (
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
            )}

            <Button
              size="sm"
              variant="secondary"
              onClick={handleDelete}
              disabled={disabled}
              className={styles.btnDelete}
              icon="trash"
            >
              {delBtnText}
            </Button>

            {showPeek && onPeek && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onPeek}
                disabled={disabled}
                className={styles.btnQuery}
                icon="eye"
              >
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
                <Input
                  type="number"
                  placeholder="搜尋值"
                  id="searchVal"
                  defaultValue=""
                  onChange={() => {}}
                  className={styles.input}
                  disabled={disabled}
                  fullWidth={false}
                  aria-label="Search value"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const val = Number(
                      (document.getElementById("searchVal") as HTMLInputElement)
                        .value,
                    );
                    onSearchNode(val, "search");
                  }}
                  disabled={disabled}
                  className={styles.btnSearch}
                  icon="search"
                >
                  Search
                </Button>
                {isBST && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onSearchNode(0, "min")}
                      disabled={disabled}
                      className={styles.btnQuery}
                    >
                      Min
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onSearchNode(0, "max")}
                      disabled={disabled}
                      className={styles.btnQuery}
                    >
                      Max
                    </Button>
                    {/* Floor/Ceil 需要參考輸入框的值 */}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const val = Number(
                          (
                            document.getElementById(
                              "searchVal",
                            ) as HTMLInputElement
                          ).value,
                        );
                        if (!isNaN(val)) onSearchNode(val, "floor");
                        else alert("Floor 需要輸入參考數值");
                      }}
                      disabled={disabled}
                      className={styles.btnQuery}
                    >
                      Floor
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const val = Number(
                          (
                            document.getElementById(
                              "searchVal",
                            ) as HTMLInputElement
                          ).value,
                        );
                        if (!isNaN(val)) onSearchNode(val, "ceil");
                        else alert("Ceil 需要輸入參考數值");
                      }}
                      disabled={disabled}
                      className={styles.btnQuery}
                    >
                      Ceil
                    </Button>{" "}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DataActionBar;
