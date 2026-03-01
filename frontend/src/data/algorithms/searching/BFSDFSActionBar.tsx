import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import type { AlgoActionBarProps, AlgorithmViewMode } from "@/types/implementation";
import { DATA_LIMITS } from "@/constants/dataLimits";
import {
  ActionBarContainer,
  ActionBarGroup,
  GraphLoaderModal,
  GridLoaderModal,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const BFSDFSActionBar: React.FC<AlgoActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  onLimitExceeded,
  disabled = false,
  onRun,
  viewMode = "graph",
  onViewModeChange,
  currentData,
  maxNodes,
}) => {
  const [randomCount, setRandomCount] = useState(DATA_LIMITS.DEFAULT_RANDOM_COUNT);
  const [randomCountInput, setRandomCountInput] = useState(
    String(DATA_LIMITS.DEFAULT_RANDOM_COUNT)
  );
  const [gridRows, setGridRows] = useState("3");
  const [gridCols, setGridCols] = useState("5");
  const [showGridLoader, setShowGridLoader] = useState(false);
  const [showGraphLoader, setShowGraphLoader] = useState(false);
  const [graphStartElement, setGraphStartElement] = useState("");
  const [graphEndElement, setGraphEndElement] = useState("");
  const [gridStartElement, setGridStartElement] = useState("");
  const [gridEndElement, setGridEndElement] = useState("");

  const handleRandomGrid = () => {
    const r = parseInt(gridRows) || 3;
    const c = parseInt(gridCols) || 5;
    (onRandomData as any)({ rows: r, cols: c });
  };

  const normalizeId = (val: string) => {
    const num = parseInt(val, 10);
    return isNaN(num) ? val : String(num);
  };

  const handleRun = () => {
    if (viewMode === "grid") {
      let startId = undefined;
      let endId = undefined;

      if (gridStartElement !== "" || gridEndElement !== "") {
        if (!currentData || !Array.isArray(currentData)) {
          alert("目前沒有圖形資料，無法指定起點/終點");
          return;
        }
        const maxIndex = currentData.length - 1;

        if (gridStartElement !== "") {
          const s = parseInt(gridStartElement, 10);
          if (isNaN(s) || s < 0 || s > maxIndex) {
            alert(`起點索引 ${s} 超出範圍 (0 ~ ${maxIndex})`);
            return;
          }
          if (currentData[s].val === "wall") {
            alert(`起點索引 ${s} 是牆壁，無法通行`);
            return;
          }
          startId = s.toString();
        }

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
      onRun({ mode: "grid", rows: r, cols: c, startNode: startId, endNode: endId });
    } else {
      let startId = undefined;
      let endId = undefined;

      if (graphStartElement !== "" || graphEndElement !== "") {
        if (!currentData || !currentData.nodes) {
          alert("目前沒有圖形資料，無法指定起點/終點");
          return;
        }
        const nodes = currentData.nodes as { id: string }[];

        if (graphStartElement !== "") {
          const normalizedVal = normalizeId(graphStartElement);
          const targetId = `node-${normalizedVal}`;
          if (!nodes.find((n) => n.id === targetId)) {
            alert(`起點 node-${normalizedVal} 不存在`);
            return;
          }
          startId = targetId;
        }

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
    }
  };

  return (
    <ActionBarContainer>
      <GridLoaderModal
        show={showGridLoader}
        onClose={() => setShowGridLoader(false)}
        onLoad={onLoadData}
      />
      <GraphLoaderModal
        show={showGraphLoader}
        onClose={() => setShowGraphLoader(false)}
        onLoad={onLoadData}
      />

      {/* 第一行：資料生成 */}
      <ActionBarGroup>
        {viewMode === "grid" && (
          <Tooltip content="開啟自定義迷宮資料載入介面">
            <Button
              size="sm"
              onClick={() => setShowGridLoader(!showGridLoader)}
              disabled={disabled}
            >
              載入迷宮資料
            </Button>
          </Tooltip>
        )}
        {viewMode === "graph" && (
          <Tooltip content="開啟自定義圖形資料載入介面">
            <Button
              size="sm"
              onClick={() => setShowGraphLoader(true)}
              disabled={disabled}
            >
              載入圖形資料
            </Button>
          </Tooltip>
        )}
        <Tooltip content="清除所有資料，恢復初始狀態">
          <Button size="sm" onClick={onResetData} disabled={disabled}>
            重設
          </Button>
        </Tooltip>
        <div className={styles.settingItem}>
          <label className={styles.smallLabel}>隨機筆數:</label>
          <input
            type="number"
            value={randomCountInput}
            min={DATA_LIMITS.MIN_RANDOM_COUNT}
            max={maxNodes}
            onChange={(e) => setRandomCountInput(e.target.value)}
            onBlur={() => {
              const num = Number(randomCountInput);
              if (isNaN(num) || randomCountInput.trim() === "") {
                setRandomCountInput(String(randomCount));
              } else {
                if (maxNodes !== undefined && num > maxNodes) {
                  onLimitExceeded?.();
                }
                const v = Math.min(
                  Math.max(num, DATA_LIMITS.MIN_RANDOM_COUNT),
                  maxNodes ?? num
                );
                setRandomCount(v);
                setRandomCountInput(String(v));
                onMaxNodesChange?.(v);
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
        <Tooltip content="隨機生成一組資料">
          <Button
            size="sm"
            onClick={() => {
              if (viewMode === "grid") {
                handleRandomGrid();
              } else {
                onRandomData();
              }
            }}
            disabled={disabled}
          >
            隨機
          </Button>
        </Tooltip>
        {viewMode === "grid" && (
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
      </ActionBarGroup>

      {/* 第二行：執行控制 */}
      <ActionBarGroup>
        <StaticLabel>Algorithm Control</StaticLabel>

        <div className={styles.viewModeContainer}>
          <span className={styles.viewModeLabel}>視圖:</span>
          <select
            value={viewMode}
            onChange={(e) =>
              onViewModeChange?.(e.target.value as AlgorithmViewMode)
            }
            disabled={disabled}
            className={styles.viewModeSelect}
          >
            <option value="graph">Graph (節點圖)</option>
            <option value="grid">Grid (迷宮圖)</option>
          </select>
        </div>

        <div className={styles.startEndContainer}>
          <input
            type="number"
            placeholder="起點(0)"
            value={viewMode === "graph" ? graphStartElement : gridStartElement}
            onChange={(e) =>
              viewMode === "graph"
                ? setGraphStartElement(e.target.value)
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
                ? setGraphEndElement(e.target.value)
                : setGridEndElement(e.target.value)
            }
            className={`${styles.input} ${styles.startEndInput}`}
            disabled={disabled}
          />
        </div>

        <Tooltip content="執行 BFS/DFS 演算法">
          <Button
            size="sm"
            onClick={handleRun}
            disabled={disabled}
            className={`${styles.runButton} ${styles.runButtonTechnique}`}
          >
            開始執行
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
