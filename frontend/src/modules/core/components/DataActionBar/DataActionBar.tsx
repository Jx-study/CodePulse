import React, { useState, useEffect } from "react";
import Button from "@/shared/components/Button/Button";
import styles from "./DataActionBar.module.scss";

// 定義支援的結構類型
export type StructureType =
  | "linkedlist"
  | "stack"
  | "queue"
  | "array"
  | "binarytree"
  | "bst"
  | "graph";

export interface DataActionBarProps {
  // 基本操作
  onAddNode: (value: number, mode: string, index?: number) => void;
  onDeleteNode: (mode: string, index?: number) => void;
  onSearchNode: (value: number, mode?: string) => void;
  onPeek?: () => void;

  onGraphAction?: (action: string, payload: any) => void;

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
  onGraphAction,
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

  const [sourceNode, setSourceNode] = useState<string>("");
  const [targetNode, setTargetNode] = useState<string>("");
  const [edgeWeight, setEdgeWeight] = useState<string>("1");
  const [isDirected, setIsDirected] = useState<boolean>(false);

  // init
  useEffect(() => {
    if (structureType === "stack") setInsertMode("Push");
    else if (structureType === "queue") setInsertMode("Enqueue");
    else if (structureType === "array" || structureType === "bst")
      setInsertMode("Insert");
    else setInsertMode("Head");
  }, [structureType]);

  // Linear / Tree Handlers
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

  const handleGraphAction = (action: string) => {
    if (disabled || !onGraphAction) return;

    // 封裝 payload
    const payload: any = {
      isDirected,
      weight: parseInt(edgeWeight) || 1,
    };

    if (action === "addVertex") {
      payload.value = inputValue; // 節點名稱/值
    } else if (action === "removeVertex") {
      payload.id = inputValue; // 節點 ID
    } else if (action === "addEdge") {
      payload.source = sourceNode;
      payload.target = targetNode;
    } else if (action === "removeEdge") {
      payload.source = sourceNode;
      payload.target = targetNode;
    } else if (action === "getNeighbors") {
      payload.id = inputValue;
    } else if (action === "checkAdjacent") {
      payload.source = sourceNode;
      payload.target = targetNode;
    }

    onGraphAction(action, payload);
  };

  // 判斷是否顯示某些控制項
  const isGraph = structureType === "graph";
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
                      : structureType === "graph"
                        ? "Graph Operations"
                        : "Operations"}
        </div>
        {isGraph ? (
          <>
            {/* 節點操作區 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginRight: "12px",
                paddingRight: "12px",
                borderRight: "1px solid #555",
              }}
            >
              <span style={{ color: "#aaa", fontSize: "12px" }}>節點:</span>
              <input
                placeholder="ID"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={styles.input}
                style={{ width: "60px" }}
                disabled={disabled}
              />
              <Button
                size="sm"
                onClick={() => handleGraphAction("addVertex")}
                disabled={disabled}
              >
                新增
              </Button>
              <Button
                size="sm"
                onClick={() => handleGraphAction("removeVertex")}
                disabled={disabled}
              >
                刪除
              </Button>
              <Button
                size="sm"
                onClick={() => handleGraphAction("getNeighbors")}
                disabled={disabled}
                style={{ fontSize: "10px" }}
              >
                找鄰居
              </Button>
            </div>

            {/* 邊操作區 */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ color: "#aaa", fontSize: "12px" }}>邊:</span>
              <input
                placeholder="Src"
                value={sourceNode}
                onChange={(e) => setSourceNode(e.target.value)}
                className={styles.input}
                style={{ width: "40px" }}
                disabled={disabled}
              />
              <span style={{ color: "#ccc" }}>→</span>
              <input
                placeholder="Dst"
                value={targetNode}
                onChange={(e) => setTargetNode(e.target.value)}
                className={styles.input}
                style={{ width: "40px" }}
                disabled={disabled}
              />
              {/* 權重 (暫時隱藏或保留) */}
              {/* <input
                placeholder="W"
                value={edgeWeight}
                onChange={(e) => setEdgeWeight(e.target.value)}
                className={styles.input}
                style={{ width: "30px" }}
              /> */}

              <Button
                size="sm"
                onClick={() => handleGraphAction("addEdge")}
                disabled={disabled}
              >
                連線
              </Button>
              <Button
                size="sm"
                onClick={() => handleGraphAction("removeEdge")}
                disabled={disabled}
              >
                斷線
              </Button>
              <Button
                size="sm"
                onClick={() => handleGraphAction("checkAdjacent")}
                disabled={disabled}
                style={{ fontSize: "10px" }}
              >
                檢查
              </Button>

              <label
                style={{
                  color: "#ccc",
                  fontSize: "12px",
                  marginLeft: "4px",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={isDirected}
                  onChange={(e) => setIsDirected(e.target.checked)}
                  disabled={disabled}
                  style={{ marginRight: "2px" }}
                />
                有向
              </label>
            </div>
          </>
        ) : (
          <>
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
                          (
                            document.getElementById(
                              "searchVal",
                            ) as HTMLInputElement
                          ).value,
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
                                  "searchVal",
                                ) as HTMLInputElement
                              ).value,
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
                                  "searchVal",
                                ) as HTMLInputElement
                              ).value,
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
          </>
        )}
      </div>
    </div>
  );
};

export default DataActionBar;
