import React, { useState, useEffect } from "react";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import Select from "@/shared/components/Select";
import Checkbox from "@/shared/components/Checkbox";
import { DATA_LIMITS } from "@/constants/dataLimits";
import { toast } from "@/shared/components/Toast";
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
  onRandomCountChange: (count: number) => void;
  onTailModeChange: (hasTail: boolean) => void;
  onLimitExceeded?: () => void;

  disabled?: boolean;
  structureType: StructureType;

  isDirected?: boolean;
  onIsDirectedChange?: (val: boolean) => void;
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
  onRandomCountChange,
  onTailModeChange,
  onLimitExceeded,
  disabled = false,
  structureType,
  isDirected = false,
  onIsDirectedChange,
}) => {
  const [inputValue, setInputValue] = useState<string>(""); // 節點數值
  const [indexValue, setIndexValue] = useState<string>(""); // N (索引)
  const [bulkInput, setBulkInput] = useState<string>(""); // 10,20,30...
  const [insertMode, setInsertMode] = useState<string>("Head"); // Head, Tail, Node N
  const [randomCount, setRandomCount] = useState<number>(DATA_LIMITS.DEFAULT_RANDOM_COUNT);
  const [randomCountInput, setRandomCountInput] = useState<string>(String(DATA_LIMITS.DEFAULT_RANDOM_COUNT)); // 輸入顯示用

  const [sourceNode, setSourceNode] = useState<string>("");
  const [targetNode, setTargetNode] = useState<string>("");

  const [showGraphLoader, setShowGraphLoader] = useState(false);
  const [graphNodeCount, setGraphNodeCount] = useState<string>("6");
  const [graphEdgeInput, setGraphEdgeInput] = useState<string>(
    "0 1\n0 2\n1 3\n2 4\n3 5\n4 5",
  );

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
      toast.warning("Update 需要輸入數值與索引");
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
        toast.warning("請輸入要刪除的數值");
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
    };

    const normalizeId = (val: string) => {
      const num = parseInt(val, 10);
      return isNaN(num) ? val : String(num);
    };

    if (action === "addVertex") {
      payload.value = normalizeId(inputValue); // 節點名稱/值
    } else if (action === "removeVertex") {
      payload.id = normalizeId(inputValue); // 節點 ID
    } else if (action === "addEdge") {
      payload.source = normalizeId(sourceNode);
      payload.target = normalizeId(targetNode);
    } else if (action === "removeEdge") {
      payload.source = normalizeId(sourceNode);
      payload.target = normalizeId(targetNode);
    } else if (action === "getNeighbors" || action === "getDegree") {
      payload.id = normalizeId(inputValue);
    } else if (action === "checkAdjacent") {
      payload.source = normalizeId(sourceNode);
      payload.target = normalizeId(targetNode);
    }

    onGraphAction(action, payload);
  };

  const handleLoadGraphData = () => {
    const nodeCount = parseInt(graphNodeCount);
    if (isNaN(nodeCount) || nodeCount <= 0) {
      toast.warning("請輸入有效的節點數量");
      return;
    }
    const edges = graphEdgeInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "")
      .join(",");

    const payload = `GRAPH:${nodeCount}:${edges}`;
    onLoadData(payload);
    setShowGraphLoader(false);
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
        </option>,
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
    <div className={styles.dataActionBarContainer}>
      {/* 第一行：資料控制 (DataManager) */}
      <div className={styles.actionGroup}>
        {showGraphLoader && (
          <div className={styles.modalContainer}>
            <h4 className={styles.modalTitle}>自定義 Graph 資料</h4>
            <div className={styles.modalFieldRow}>
              <label className={styles.modalLabel}>節點數量 (0 ~ N-1):</label>
              <input
                type="number"
                value={graphNodeCount}
                onChange={(e) => setGraphNodeCount(e.target.value)}
                className={`${styles.input} ${styles.nodeCountInput}`}
              />
            </div>
            <div className={styles.modalFieldColumn}>
              <label className={styles.modalLabel}>邊 (格式: 來源 目標)</label>
              <textarea
                value={graphEdgeInput}
                onChange={(e) => setGraphEdgeInput(e.target.value)}
                rows={6}
                className={styles.modalGraphTextarea}
                placeholder="0 1&#10;1 2&#10;2 0"
              />
            </div>
            <div className={styles.modalButtonGroup}>
              <Button
                size="sm"
                onClick={() => setShowGraphLoader(false)}
                className={styles.modalCancelButton}
              >
                取消
              </Button>
              <Button
                size="sm"
                onClick={handleLoadGraphData}
                className={styles.modalConfirmButton}
              >
                確認載入
              </Button>
            </div>
          </div>
        )}
        {showGraphLoader && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowGraphLoader(false)}
          />
        )}
        {isGraph ? (
          <Button
            size="sm"
            onClick={() => setShowGraphLoader(true)}
            disabled={disabled}
          >
            載入 Graph 資料
          </Button>
        ) : (
          <>
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
          </>
        )}
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
          <label className={styles.smallLabel}>隨機筆數:</label>
          <Input
            type="number"
            value={randomCountInput}
            min={DATA_LIMITS.MIN_RANDOM_COUNT}
            max={DATA_LIMITS.MAX_NODES}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRandomCountInput(e.target.value)
            }
            onBlur={() => {
              const num = Number(randomCountInput);
              if (isNaN(num) || randomCountInput.trim() === "") {
                setRandomCountInput(String(randomCount));
              } else {
                if (num > DATA_LIMITS.MAX_NODES) {
                  onLimitExceeded?.();
                }
                const v = Math.min(
                  Math.max(num, DATA_LIMITS.MIN_RANDOM_COUNT),
                  DATA_LIMITS.MAX_NODES,
                );
                setRandomCount(v);
                setRandomCountInput(String(v));
                onRandomCountChange(v);
              }
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                (e.target as HTMLInputElement).blur();
              }
            }}
            className={styles.input}
            disabled={disabled}
            fullWidth={false}
            aria-label="Random count"
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
        <div className={styles.staticLabel}>
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
            <span className={styles.smallLabel}>節點:</span>
            <Input
              placeholder="ID"
              type="number"
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInputValue(e.target.value)
              }
              className={`${styles.input} ${styles.nodeCountInput}`}
              disabled={disabled}
              fullWidth={false}
              aria-label="Node ID"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleGraphAction("addVertex")}
              disabled={disabled}
              className={styles.btnInsert}
            >
              新增
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleGraphAction("removeVertex")}
              disabled={disabled}
              className={styles.btnDelete}
            >
              刪除
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleGraphAction("getNeighbors")}
              disabled={disabled}
              className={styles.btnQuery}
            >
              找鄰居
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleGraphAction("getDegree")}
              disabled={disabled}
              className={styles.btnQuery}
            >
              度數
            </Button>

            <span className={styles.smallLabel}>邊:</span>
            <Input
              placeholder="Src"
              type="number"
              value={sourceNode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSourceNode(e.target.value)
              }
              className={`${styles.input} ${styles.gridRowColInput}`}
              disabled={disabled}
              fullWidth={false}
              aria-label="Source node"
            />
            <span className={styles.staticLabel}>→</span>
            <Input
              placeholder="Dst"
              type="number"
              value={targetNode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTargetNode(e.target.value)
              }
              className={`${styles.input} ${styles.gridRowColInput}`}
              disabled={disabled}
              fullWidth={false}
              aria-label="Target node"
            />

            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleGraphAction("addEdge")}
              disabled={disabled}
              className={styles.btnInsert}
            >
              連線
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleGraphAction("removeEdge")}
              disabled={disabled}
              className={styles.btnDelete}
            >
              斷線
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleGraphAction("checkAdjacent")}
              disabled={disabled}
              className={styles.btnQuery}
            >
              檢查
            </Button>

            <Checkbox
              label="有向"
              checked={isDirected}
              onChange={(e) =>
                onIsDirectedChange && onIsDirectedChange(e.target.checked)
              }
              disabled={disabled}
              className={styles.smallLabel}
              aria-label="Directed graph"
            />

            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleGraphAction("checkConnected")}
              disabled={disabled}
              className={styles.btnQuery}
            >
              連通性
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleGraphAction("checkCycle")}
              disabled={disabled}
              className={styles.btnQuery}
            >
              是否有環
            </Button>
          </>
        ) : isBinaryTree ? (
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
                options={[]}
                aria-label="Insert mode"
              >
                {getModeOptions()}
              </Select>
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
                aria-label="Index"
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
                onClick={onPeek}
                disabled={disabled}
                className={styles.btnQuery}
                icon="eye"
              >
                Peek
              </Button>
            )}

            {showSearchMode && (
              <>
                <Input
                  type="number"
                  placeholder="搜尋值"
                  id="searchVal"
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
                        else toast.warning("Floor 需要輸入參考數值");
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
                        else toast.warning("Ceil 需要輸入參考數值");
                      }}
                      disabled={disabled}
                      className={styles.btnQuery}
                    >
                      Ceil
                    </Button>
                  </>
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
