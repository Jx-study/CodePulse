import React, { useState, useEffect } from "react";
import Button from "@/shared/components/Button/Button";
import styles from "../DataActionBar/DataActionBar.module.scss";

export type AlgorithmViewMode = "graph" | "grid";

export interface RunParams {
  searchValue?: number;
  range?: [number, number];
  mode?: "graph" | "grid";
  rows?: number;
  cols?: number;
}

interface AlgorithmActionBarProps {
  onLoadData: (data: string) => void;
  onRandomData: () => void;
  onResetData: () => void;
  onRun: (params?: RunParams) => void;
  disabled?: boolean;
  category?: string;
  algorithmId?: string;
  viewMode: AlgorithmViewMode;
  onViewModeChange: (mode: AlgorithmViewMode) => void;
}

export const AlgorithmActionBar: React.FC<AlgorithmActionBarProps> = ({
  onLoadData,
  onRandomData,
  onResetData,
  onRun,
  disabled = false,
  category = "sorting",
  algorithmId,
  viewMode,
  onViewModeChange,
}) => {
  const [bulkInput, setBulkInput] = useState<string>("");
  const [dataSize, setDataSize] = useState<number>(10);
  const [searchValue, setSearchValue] = useState<string>("");
  const [rangeStart, setRangeStart] = useState<string>("");
  const [rangeEnd, setRangeEnd] = useState<string>("");
  const [gridRows, setGridRows] = useState<string>("3");
  const [gridCols, setGridCols] = useState<string>("5");
  const [showGridLoader, setShowGridLoader] = useState(false);
  const [gridInputText, setGridInputText] = useState(
    "0 0 0 0 0\n0 1 1 1 0\n0 0 0 0 0"
  );

  // 判斷演算法類型
  const isSearching = category === "searching";
  const isSorting = category === "sorting";
  const isTechnique = category === "technique";
  const isPrefixSum = algorithmId === "prefixsum";
  const isGraphAlgo =
    category === "graph" ||
    (algorithmId && ["bfs", "dfs"].includes(algorithmId));

  // 根據演算法類型設定預設資料筆數
  useEffect(() => {
    if (isSorting) {
      setDataSize(10);
    } else if (isSearching && !isPrefixSum) {
      setDataSize(15);
    } else if (isPrefixSum) {
      setDataSize(8);
    }
  }, [category, algorithmId, isSorting, isSearching, isPrefixSum]);

  const handleRun = () => {
    if (viewMode === "grid" && isGraphAlgo) {
      const r = parseInt(gridRows) || 3;
      const c = parseInt(gridCols) || 5;
      onRun({ mode: "grid", rows: r, cols: c });
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
      } else if (!isNaN(start) && !isNaN(end)) {
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

  // 判斷是否顯示特定輸入欄位
  const showSearchInput = isSearching && !isPrefixSum;
  const showRangeInput = isPrefixSum;

  return (
    <div
      className={styles.dataActionBarContainer}
      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
    >
      {showGridLoader && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            background: "#222",
            padding: "24px",
            border: "1px solid #555",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.7)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <h4 style={{ margin: "0", color: "#fff", fontSize: "16px" }}>
            輸入迷宮資料 (0=路, 1=牆)
          </h4>
          <textarea
            value={gridInputText}
            onChange={(e) => setGridInputText(e.target.value)}
            rows={5}
            style={{
              width: "350px",
              fontFamily: "monospace",
              fontSize: "14px",
              padding: "12px",
              background: "#111",
              color: "#eee",
              border: "1px solid #444",
              borderRadius: "4px",
              resize: "none",
            }}
            placeholder="0 0 0&#10;0 1 0&#10;0 0 0"
          />
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "8px",
              justifyContent: "flex-end",
            }}
          >
            <Button
              size="sm"
              onClick={() => setShowGridLoader(false)}
              style={{ background: "#555" }}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleLoadGridData}
              style={{ background: "#2e7d32" }}
            >
              確認載入
            </Button>
          </div>
        </div>
      )}

      {/* 第一行：資料生成 */}
      <div className={styles.actionGroup}>
        {viewMode === "grid" && isGraphAlgo ? (
          <Button
            size="sm"
            onClick={() => setShowGridLoader(!showGridLoader)}
            disabled={disabled}
            style={{ marginRight: "8px" }}
          >
            載入迷宮資料
          </Button>
        ) : (
          <>
            <input
              type="text"
              placeholder="3,5,8,10..."
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
          </>
        )}
        <Button size="sm" onClick={onResetData} disabled={disabled}>
          重設
        </Button>
        {!(viewMode === "grid" && isGraphAlgo) && (
          <div className={styles.settingItem}>
            <label style={{ color: "#ccc", fontSize: "12px" }}>筆數:</label>
            <input
              type="number"
              value={dataSize}
              onChange={(e) => setDataSize(Number(e.target.value))}
              style={{
                width: "50px",
                background: "#222",
                color: "#fff",
                border: "1px solid #555",
              }}
              disabled={disabled}
            />
          </div>
        )}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginRight: "8px",
            }}
          >
            <label style={{ color: "#ccc", fontSize: "12px" }}>R:</label>
            <input
              type="number"
              value={gridRows}
              onChange={(e) => setGridRows(e.target.value)}
              className={styles.input}
              style={{ width: "40px" }}
            />
            <label style={{ color: "#ccc", fontSize: "12px" }}>C:</label>
            <input
              type="number"
              value={gridCols}
              onChange={(e) => setGridCols(e.target.value)}
              className={styles.input}
              style={{ width: "40px" }}
            />
          </div>
        )}
      </div>

      {/* 第二行：執行控制 */}
      <div className={styles.actionGroup}>
        <div
          className={styles.staticLabel}
          style={{ color: "#ccc", padding: "0 8px" }}
        >
          {getControlLabel()}
        </div>

        {isGraphAlgo && (
          <div
            style={{
              marginRight: "12px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{ color: "#888", fontSize: "12px", marginRight: "6px" }}
            >
              視圖:
            </span>
            <select
              value={viewMode}
              onChange={(e) =>
                onViewModeChange(e.target.value as AlgorithmViewMode)
              }
              disabled={disabled}
              className={styles.select}
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                background: "#333",
                color: "#fff",
                border: "1px solid #555",
              }}
            >
              <option value="graph">Graph (節點圖)</option>
              <option value="grid">Grid (迷宮圖)</option>
            </select>
          </div>
        )}

        {/* 搜尋演算法的搜尋值輸入 */}
        {showSearchInput && (
          <input
            type="number"
            placeholder="搜尋值"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={styles.input}
            style={{ width: "80px", marginRight: "8px" }}
            disabled={disabled}
          />
        )}

        {/* Prefix Sum 的區間輸入 */}
        {showRangeInput && (
          <div
            style={{
              display: "flex",
              gap: "4px",
              alignItems: "center",
              marginRight: "8px",
            }}
          >
            <input
              type="number"
              placeholder="L"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className={styles.input}
              style={{ width: "50px" }}
              disabled={disabled}
            />
            <span style={{ color: "#ccc" }}>-</span>
            <input
              type="number"
              placeholder="R"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className={styles.input}
              style={{ width: "50px" }}
              disabled={disabled}
            />
          </div>
        )}

        <Button
          size="sm"
          onClick={handleRun}
          disabled={disabled}
          style={{
            width: "100px",
            background: isSorting
              ? "#2e7d32"
              : isSearching
              ? "#1976d2"
              : "#f57c00",
          }}
        >
          {getRunButtonText()}
        </Button>
      </div>
    </div>
  );
};
