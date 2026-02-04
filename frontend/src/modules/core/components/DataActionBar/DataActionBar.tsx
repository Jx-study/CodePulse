import React, { useState, useEffect } from "react";
import Button from "@/shared/components/Button";
import FormField from "@/shared/components/FormField";
import styles from "./DataActionBar.module.scss";

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
        <FormField
          type="text"
          placeholder="10,40,30..."
          value={bulkInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBulkInput(e.target.value)}
          inputClassName={styles.input}
          className={styles.formFieldWrapper}
          disabled={disabled}
          aria-label="Bulk data input"
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
          <label className={styles.staticLabel}>最大筆數: </label>
          <FormField
            type="number"
            value={maxNodes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const v = Number(e.target.value);
              setMaxNodes(v);
              onMaxNodesChange(v);
            }}
            inputClassName={styles.input}
            className={styles.formFieldWrapper}
            disabled={disabled}
            aria-label="Maximum nodes"
          />
        </div>

        {showTailMode && (
          <FormField
            type="select"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onTailModeChange(e.target.value === "hasTail")}
            inputClassName={styles.select}
            className={styles.formFieldWrapper}
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
              onClick={() => onSearchNode(0, "preorder")}
              disabled={disabled}
            >
              Preorder
            </Button>
            <Button
              size="sm"
              onClick={() => onSearchNode(0, "inorder")}
              disabled={disabled}
            >
              Inorder
            </Button>
            <Button
              size="sm"
              onClick={() => onSearchNode(0, "postorder")}
              disabled={disabled}
            >
              Postorder
            </Button>
            <Button
              size="sm"
              onClick={() => onSearchNode(0, "bfs")}
              disabled={disabled}
            >
              BFS (Level-order)
            </Button>
          </>
        ) : (
          <>
            {structureType === "linkedlist" && (
              <FormField
                type="select"
                value={insertMode}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setInsertMode(e.target.value)}
                inputClassName={styles.select}
                className={styles.formFieldWrapper}
                disabled={disabled}
                options={[
                  { value: "Head", label: "Head" },
                  { value: "Tail", label: "Tail" },
                  { value: "Node N", label: "Node N" },
                ]}
                aria-label="Insert mode"
              />
            )}

            <FormField
              type="number"
              placeholder="數值"
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
              inputClassName={styles.input}
              className={styles.formFieldWrapper}
              disabled={disabled}
              aria-label="Node value"
            />

            {showIndexInput && (
              <FormField
                type="number"
                placeholder="Index"
                value={indexValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIndexValue(e.target.value)}
                inputClassName={styles.input}
                className={styles.formFieldWrapper}
                disabled={disabled}
                aria-label="Node index"
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
                <FormField
                  type="number"
                  placeholder="搜尋值"
                  id="searchVal"
                  value=""
                  onChange={() => {}}
                  inputClassName={styles.input}
                  className={styles.formFieldWrapper}
                  disabled={disabled}
                  aria-label="Search value"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    const val = Number(
                      (document.getElementById("searchVal") as HTMLInputElement)
                        .value
                    );
                    onSearchNode(val, "search");
                  }}
                  disabled={disabled}
                >
                  Search
                </Button>
                {isBST && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onSearchNode(0, "min")}
                      disabled={disabled}
                    >
                      Min
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onSearchNode(0, "max")}
                      disabled={disabled}
                    >
                      Max
                    </Button>
                    {/* Floor/Ceil 需要參考輸入框的值 */}
                    <Button
                      size="sm"
                      onClick={() => {
                        const val = Number(
                          (
                            document.getElementById(
                              "searchVal"
                            ) as HTMLInputElement
                          ).value
                        );
                        if (!isNaN(val)) onSearchNode(val, "floor");
                        else alert("Floor 需要輸入參考數值");
                      }}
                      disabled={disabled}
                    >
                      Floor
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        const val = Number(
                          (
                            document.getElementById(
                              "searchVal"
                            ) as HTMLInputElement
                          ).value
                        );
                        if (!isNaN(val)) onSearchNode(val, "ceil");
                        else alert("Ceil 需要輸入參考數值");
                      }}
                      disabled={disabled}
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
