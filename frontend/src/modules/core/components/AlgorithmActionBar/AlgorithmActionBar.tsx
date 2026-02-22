import React, { useState, useEffect } from "react";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import { DATA_LIMITS } from "@/constants/dataLimits";
import styles from "../DataActionBar/DataActionBar.module.scss";

export type AlgorithmViewMode = string;

export interface RunParams {
  searchValue?: number;
  range?: [number, number];
  mode?: string;
  rows?: number;
  cols?: number;
  startNode?: string;
  endNode?: string;
  targetSum?: number;
}

interface AlgorithmActionBarProps {
  onLoadData: (data: string) => void;
  onRandomData: () => void;
  onResetData: () => void;
  onRun: (params?: RunParams) => void;
  onRandomCountChange?: (count: number) => void;
  onLimitExceeded?: () => void;
  disabled?: boolean;
  category?: string;
  algorithmId?: string;
  viewMode: AlgorithmViewMode;
  onViewModeChange: (mode: AlgorithmViewMode) => void;
  currentData?: any;
}

export const AlgorithmActionBar: React.FC<AlgorithmActionBarProps> = ({
  onLoadData,
  onRandomData,
  onResetData,
  onRun,
  onRandomCountChange,
  onLimitExceeded,
  disabled = false,
  category = "sorting",
  algorithmId,
  viewMode,
  onViewModeChange,
  currentData,
}) => {
  const [bulkInput, setBulkInput] = useState<string>("");
  const [randomCount, setRandomCount] = useState<number>(
    DATA_LIMITS.DEFAULT_RANDOM_COUNT,
  );
  const [randomCountInput, setRandomCountInput] = useState<string>(
    String(DATA_LIMITS.DEFAULT_RANDOM_COUNT),
  );
  const [searchValue, setSearchValue] = useState<string>("");
  const [rangeStart, setRangeStart] = useState<string>("");
  const [rangeEnd, setRangeEnd] = useState<string>("");
  const [gridRows, setGridRows] = useState<string>("3");
  const [gridCols, setGridCols] = useState<string>("5");
  const [showGridLoader, setShowGridLoader] = useState(false);
  const [gridInputText, setGridInputText] = useState(
    "0 0 0 0 0\n0 1 1 1 0\n0 0 0 0 0",
  );
  const [showGraphLoader, setShowGraphLoader] = useState(false);
  const [graphNodeCount, setGraphNodeCount] = useState<string>("6");
  const [graphEdgeInput, setGraphEdgeInput] = useState<string>(
    "0 1\n0 2\n1 3\n2 4\n3 5\n4 5",
  );
  const [graphStartElement, setgraphStartElement] = useState<string>("");
  const [graphEndElement, setgraphEndElement] = useState<string>("");

  const [gridStartElement, setGridStartElement] = useState<string>("");
  const [gridEndElement, setGridEndElement] = useState<string>("");

  const [windowMode, setWindowMode] = useState<string>("longest_lte");
  const [targetSum, setTargetSum] = useState<string>("20");

  // 判斷演算法類型
  const isSearching = category === "searching";
  const isSorting = category === "sorting";
  const isTechnique = category === "technique";
  const isPrefixSum = algorithmId === "prefixsum";
  const isSlidingWindow = algorithmId === "slidingwindow";
  const isGraphAlgo =
    category === "graph" ||
    (algorithmId && ["bfs", "dfs"].includes(algorithmId));

  // 根據演算法類型設定預設資料筆數
  useEffect(() => {
    // TODO: check
    if (isSorting) {
      setRandomCount(DATA_LIMITS.DEFAULT_RANDOM_COUNT);
    } else if (isSearching && !isPrefixSum) {
      setRandomCount(DATA_LIMITS.DEFAULT_RANDOM_COUNT);
    } else if (isPrefixSum || isSlidingWindow) {
      setRandomCount(DATA_LIMITS.DEFAULT_RANDOM_COUNT);
    }
  }, [category, algorithmId, isSorting, isSearching, isPrefixSum]);

  const handleRun = () => {
    const normalizeId = (val: string) => {
      const num = parseInt(val, 10);
      return isNaN(num) ? val : String(num);
    };
    if (viewMode === "grid" && isGraphAlgo) {
      let startId = undefined;
      let endId = undefined;

      // 1. 如果使用者有輸入，進行驗證
      if (gridStartElement !== "" || gridEndElement !== "") {
        // 確保 currentData 存在且是 Graph 格式
        if (!currentData || !Array.isArray(currentData)) {
          alert("目前沒有圖形資料，無法指定起點/終點");
          return;
        }

        const maxIndex = currentData.length - 1;

        // 驗證起點
        if (gridStartElement !== "") {
          const s = parseInt(gridStartElement, 10);

          // 檢查範圍
          if (isNaN(s) || s < 0 || s > maxIndex) {
            alert(`起點索引 ${s} 超出範圍 (0 ~ ${maxIndex})`);
            return;
          }
          // 檢查是否為牆壁
          if (currentData[s].val === "wall") {
            alert(`起點索引 ${s} 是牆壁，無法通行`);
            return;
          }
          startId = s.toString();
        }

        // 驗證終點
        if (gridEndElement !== "") {
          const e = parseInt(gridEndElement, 10);

          if (isNaN(e) || e < 0 || e > maxIndex) {
            alert(`終點索引 ${e} 超出範圍 (0 ~ ${maxIndex})`);
            return;
          }
          if (currentData[e].val === 1) {
            alert(`終點索引 ${e} 是牆壁，無法通行`);
            return;
          }
          endId = e.toString();
        }
      }

      const r = parseInt(gridRows) || 3;
      const c = parseInt(gridCols) || 5;

      onRun({
        mode: "grid",
        rows: r,
        cols: c,
        startNode: startId,
        endNode: endId,
      });
    } else if (viewMode === "graph" && isGraphAlgo) {
      let startId = undefined;
      let endId = undefined;

      // 1. 如果使用者有輸入，進行驗證
      if (graphStartElement !== "" || graphEndElement !== "") {
        // 確保 currentData 存在且是 Graph 格式
        if (!currentData || !currentData.nodes) {
          alert("目前沒有圖形資料，無法指定起點/終點");
          return;
        }

        const nodes = currentData.nodes as { id: string }[];

        // 驗證起點
        if (graphStartElement !== "") {
          const normalizedVal = normalizeId(graphStartElement);
          const targetId = `node-${normalizedVal}`;
          if (!nodes.find((n) => n.id === targetId)) {
            alert(`起點 node-${normalizedVal} 不存在`);
            return;
          }
          startId = targetId;
        }

        // 驗證終點
        if (graphEndElement !== "") {
          const normalizedVal = normalizeId(graphEndElement);
          const targetId = `node-${normalizedVal}`;
          if (!nodes.find((n) => n.id === targetId)) {
            alert(`終點 node-${normalizedVal} 不存在`);
            return;
          }
          endId = targetId;
        }
      }

      onRun({ mode: "graph", startNode: startId, endNode: endId });
    } else if (isSlidingWindow) {
      const val = parseInt(targetSum, 10);
      if (!isNaN(val)) {
        onRun({ mode: windowMode, targetSum: val });
      } else {
        alert("請輸入有效的目標和數值");
      }
    } else if (isSearching && !isPrefixSum) {
      const val = parseInt(searchValue);
      if (!isNaN(val)) {
        onRun({ searchValue: val });
      } else {
        alert("請輸入有效的搜尋數值");
      }
    } else if (isPrefixSum) {
      const start = parseInt(rangeStart);
      const end = parseInt(rangeEnd);

      if (isNaN(start) && isNaN(end)) {
        onRun({});
      } else if (
        !isNaN(start) &&
        !isNaN(end) &&
        start <= end &&
        start >= 0 &&
        end >= 0
      ) {
        onRun({ range: [start, end] });
      } else {
        alert("請輸入完整的區間 (Start, End)");
      }
    } else {
      onRun();
    }
  };

  // 根據演算法類型動態生成控制區域標籤
  const getControlLabel = () => {
    if (isSorting) return "Sorting Control";
    if (isSearching && !isPrefixSum) return "Searching Control";
    if (isPrefixSum) return "Prefix Sum Control";
    if (isTechnique) return "Technique Control";
    return "Algorithm Control";
  };

  // 根據演算法類型動態生成按鈕文字
  const getRunButtonText = () => {
    if (isSorting) return "開始排序";
    if (isSearching && !isPrefixSum) return "開始搜尋";
    if (isPrefixSum) return "開始演示";
    if (isTechnique) return "開始演示";
    return "開始執行";
  };

  const handleRandomGrid = () => {
    const r = parseInt(gridRows) || 3;
    const c = parseInt(gridCols) || 5;
    (onRandomData as any)({ rows: r, cols: c });
  };

  const handleLoadGridData = () => {
    // 解析輸入字串
    const rowsArr = gridInputText.trim().split("\n");
    const gridData: number[] = [];
    let cols = 0;
    let rows = 0;

    rowsArr.forEach((rowStr) => {
      // 支援空格或逗號分隔
      const cells = rowStr
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      if (cells.length > 0) {
        gridData.push(...cells);
        cols = Math.max(cols, cells.length); // 取最長的一列作為 cols
        rows++;
      }
    });

    const flatData = gridData.join(",");
    const payload = `GRID:${cols}:${flatData}`; // 自定義格式

    onLoadData(payload);
    setShowGridLoader(false);
  };

  const handleLoadGraphData = () => {
    const nodeCount = parseInt(graphNodeCount);
    if (isNaN(nodeCount) || nodeCount <= 0) {
      alert("請輸入有效的節點數量");
      return;
    }

    // 將邊的字串 (換行分隔) 壓縮成單行或特定格式傳遞

    // 1. 將輸入字串依換行分割
    // 2. 去除前後空白
    // 3. 過濾空行
    // 4. 用逗號連接
    const edges = graphEdgeInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "")
      .join(",");

    // 格式協定: "GRAPH:nodeCount:edgeString"
    const payload = `GRAPH:${nodeCount}:${edges}`;

    onLoadData(payload);
    setShowGraphLoader(false);
  };

  // 判斷是否顯示特定輸入欄位
  const showSearchInput = isSearching && !isPrefixSum;
  const showRangeInput = isPrefixSum;

  return (
    <div className={styles.dataActionBarContainer}>
      {showGridLoader && (
        <div className={styles.modalContainer}>
          <h4 className={styles.modalTitle}>輸入迷宮資料 (0=路, 1=牆)</h4>
          <textarea
            value={gridInputText}
            onChange={(e) => setGridInputText(e.target.value)}
            rows={5}
            className={styles.modalTextarea}
            placeholder="0 0 0&#10;0 1 0&#10;0 0 0"
          />
          <div className={styles.modalButtonGroup}>
            <Button
              size="sm"
              onClick={() => setShowGridLoader(false)}
              className={styles.modalCancelButton}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleLoadGridData}
              className={styles.modalConfirmButton}
            >
              確認載入
            </Button>
          </div>
        </div>
      )}

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

      {(showGridLoader || showGraphLoader) && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            setShowGridLoader(false);
            setShowGraphLoader(false);
          }}
        />
      )}

      {/* 第一行：資料生成 */}
      <div className={styles.actionGroup}>
        {viewMode === "grid" && isGraphAlgo && (
          <Button
            size="sm"
            onClick={() => setShowGridLoader(!showGridLoader)}
            disabled={disabled}
          >
            載入迷宮資料
          </Button>
        )}
        {viewMode === "graph" && isGraphAlgo && (
          <Button
            size="sm"
            onClick={() => setShowGraphLoader(true)}
            disabled={disabled}
          >
            載入圖形資料
          </Button>
        )}
        {!(isGraphAlgo && (viewMode === "grid" || viewMode === "graph")) && (
          <>
            <input
              type="text"
              placeholder="3,5,8,10..."
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              className={`${styles.input} ${styles.bulkDataInput}`}
              disabled={disabled}
            />
            <Button
              size="sm"
              onClick={() => onLoadData(bulkInput)}
              disabled={disabled}
            >
              載入資料
            </Button>
          </>
        )}
        <Button size="sm" onClick={onResetData} disabled={disabled}>
          重設
        </Button>
        <div className={styles.settingItem}>
          <label className={styles.smallLabel}>隨機筆數:</label>
          <input
            type="number"
            value={randomCountInput}
            min={DATA_LIMITS.MIN_RANDOM_COUNT}
            max={DATA_LIMITS.MAX_NODES}
            onChange={(e) => setRandomCountInput(e.target.value)}
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
                onRandomCountChange?.(v);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                (e.target as HTMLInputElement).blur();
              }
            }}
            className={styles.input}
            disabled={disabled}
          />
        </div>
        <Button
          size="sm"
          onClick={() => {
            if (viewMode === "grid" && isGraphAlgo) {
              handleRandomGrid();
            } else {
              onRandomData();
            }
          }}
          disabled={disabled}
        >
          隨機
        </Button>
        {viewMode === "grid" && isGraphAlgo && (
          <div className={styles.gridRowsColsContainer}>
            <label className={styles.smallLabel}>R:</label>
            <input
              type="number"
              min="1"
              value={gridRows}
              onChange={(e) => setGridRows(e.target.value)}
              className={`${styles.input} ${styles.gridRowColInput}`}
            />
            <label className={styles.smallLabel}>C:</label>
            <input
              type="number"
              min="1"
              value={gridCols}
              onChange={(e) => setGridCols(e.target.value)}
              className={`${styles.input} ${styles.gridRowColInput}`}
            />
          </div>
        )}
      </div>

      {/* 第二行：執行控制 */}
      <div className={styles.actionGroup}>
        <div className={styles.staticLabel}>{getControlLabel()}</div>

        {isGraphAlgo && (
          <div className={styles.viewModeContainer}>
            <span className={styles.viewModeLabel}>視圖:</span>
            <select
              value={viewMode}
              onChange={(e) =>
                onViewModeChange(e.target.value as AlgorithmViewMode)
              }
              disabled={disabled}
              className={styles.viewModeSelect}
            >
              <option value="graph">Graph (節點圖)</option>
              <option value="grid">Grid (迷宮圖)</option>
            </select>
          </div>
        )}

        {isGraphAlgo && (
          <div className={styles.startEndContainer}>
            <input
              type="number"
              placeholder="起點(0)"
              value={
                viewMode === "graph" ? graphStartElement : gridStartElement
              }
              onChange={(e) =>
                viewMode === "graph"
                  ? setgraphStartElement(e.target.value)
                  : setGridStartElement(e.target.value)
              }
              className={`${styles.input} ${styles.startEndInput}`}
              disabled={disabled}
            />
            <span className={styles.startEndSeparator}>-</span>
            <input
              type="number"
              placeholder="終點(N)"
              value={viewMode === "graph" ? graphEndElement : gridEndElement}
              onChange={(e) =>
                viewMode === "graph"
                  ? setgraphEndElement(e.target.value)
                  : setGridEndElement(e.target.value)
              }
              className={`${styles.input} ${styles.startEndInput}`}
              disabled={disabled}
            />
          </div>
        )}

        {isSlidingWindow && (
          <>
            <div className={styles.viewModeContainer}>
              <span className={styles.viewModeLabel}>模式:</span>
              <select
                value={windowMode}
                onChange={(e) => {
                  const newMode = e.target.value;
                  setWindowMode(newMode);

                  // 立即觸發 onRun (這樣會直接呼叫 executeAction("run"))
                  // 強迫畫面馬上變成 "最短" 的初始狀態 (Step 0)
                  // onRun({
                  //   mode: newMode,
                  //   targetSum: parseInt(targetSum, 10) || 20,
                  // });
                }}
                disabled={disabled}
                className={styles.viewModeSelect}
              >
                <option value="longest_lte">最長區間 (Sum &le; Target)</option>
                <option value="shortest_gte">最短區間 (Sum &ge; Target)</option>
              </select>
            </div>
            <Input
              type="number"
              placeholder="目標和"
              value={targetSum}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTargetSum(e.target.value)
              }
              className={styles.input}
              disabled={disabled}
              fullWidth={false}
              aria-label="Target sum"
            />
          </>
        )}

        {/* 搜尋演算法的搜尋值輸入 */}
        {showSearchInput && (
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
        )}

        {/* Prefix Sum 的區間輸入 */}
        {showRangeInput && (
          <div className={styles.rangeInput}>
            <Input
              type="number"
              placeholder="L"
              value={rangeStart}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRangeStart(e.target.value)
              }
              className={styles.input}
              disabled={disabled}
              fullWidth={false}
              aria-label="Range start"
            />
            <span className={styles.staticLabel}>-</span>
            <Input
              type="number"
              placeholder="R"
              value={rangeEnd}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRangeEnd(e.target.value)
              }
              className={styles.input}
              disabled={disabled}
              fullWidth={false}
              aria-label="Range end"
            />
          </div>
        )}

        <Button
          size="sm"
          onClick={handleRun}
          disabled={disabled}
          className={`${styles.runButton} ${
            isSorting
              ? styles.runButtonSorting
              : isSearching
                ? styles.runButtonSearching
                : styles.runButtonTechnique
          }`}
        >
          {getRunButtonText()}
        </Button>
      </div>
    </div>
  );
};
