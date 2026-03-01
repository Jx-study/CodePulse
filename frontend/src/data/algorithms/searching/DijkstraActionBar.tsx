import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Checkbox from "@/shared/components/Checkbox";
import type { AlgoActionBarProps } from "@/types/implementation";
import { DATA_LIMITS } from "@/constants/dataLimits";
import {
  ActionBarContainer,
  ActionBarGroup,
  GraphLoaderModal,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const DijkstraActionBar: React.FC<AlgoActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  onLimitExceeded,
  disabled = false,
  onRun,
  isDirected = false,
  onIsDirectedChange,
  currentData,
}) => {
  const [randomCount, setRandomCount] = useState(DATA_LIMITS.DEFAULT_RANDOM_COUNT);
  const [randomCountInput, setRandomCountInput] = useState(
    String(DATA_LIMITS.DEFAULT_RANDOM_COUNT)
  );
  const [showGraphLoader, setShowGraphLoader] = useState(false);
  const [graphStartElement, setGraphStartElement] = useState("");
  const [graphEndElement, setGraphEndElement] = useState("");

  const normalizeId = (val: string) => {
    const num = parseInt(val, 10);
    return isNaN(num) ? val : String(num);
  };

  const handleRun = () => {
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

    onRun({ mode: "graph", startNode: startId, endNode: endId, isDirected });
  };

  return (
    <ActionBarContainer>
      <GraphLoaderModal
        show={showGraphLoader}
        onClose={() => setShowGraphLoader(false)}
        onLoad={onLoadData}
        isWeighted={true}
      />

      {/* 第一行：資料生成 */}
      <ActionBarGroup>
        <Tooltip content="開啟自定義帶權重圖形資料載入介面">
          <Button
            size="sm"
            onClick={() => setShowGraphLoader(true)}
            disabled={disabled}
          >
            載入圖形資料
          </Button>
        </Tooltip>
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
        <Tooltip content="隨機生成一組帶權重的圖形資料">
          <Button size="sm" onClick={() => onRandomData()} disabled={disabled}>
            隨機
          </Button>
        </Tooltip>
      </ActionBarGroup>

      {/* 第二行：執行控制 */}
      <ActionBarGroup>
        <StaticLabel>Dijkstra Control</StaticLabel>

        <div className={styles.startEndContainer}>
          <input
            type="number"
            placeholder="起點(0)"
            value={graphStartElement}
            onChange={(e) => setGraphStartElement(e.target.value)}
            className={`${styles.input} ${styles.startEndInput}`}
            disabled={disabled}
          />
          <span className={styles.startEndSeparator}>-</span>
          <input
            type="number"
            placeholder="終點(N)"
            value={graphEndElement}
            onChange={(e) => setGraphEndElement(e.target.value)}
            className={`${styles.input} ${styles.startEndInput}`}
            disabled={disabled}
          />
        </div>

        <Checkbox
          label="有向"
          checked={isDirected}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onIsDirectedChange && onIsDirectedChange(e.target.checked)
          }
          disabled={disabled}
          className={styles.smallLabel}
          aria-label="Directed graph"
        />

        <Tooltip content="執行 Dijkstra 最短路徑演算法">
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
