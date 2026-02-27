import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import Checkbox from "@/shared/components/Checkbox";
import type { DSActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  GraphLoaderModal,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";
import { DATA_LIMITS } from "@/constants/dataLimits";

export const GraphActionBar: React.FC<DSActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  onLimitExceeded,
  disabled = false,
  onGraphAction,
  isDirected = false,
  onIsDirectedChange,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [sourceNode, setSourceNode] = useState("");
  const [targetNode, setTargetNode] = useState("");
  const [showGraphLoader, setShowGraphLoader] = useState(false);
  const [randomCount, setRandomCount] = useState(DATA_LIMITS.DEFAULT_RANDOM_COUNT);
  const [randomCountInput, setRandomCountInput] = useState(
    String(DATA_LIMITS.DEFAULT_RANDOM_COUNT)
  );

  const handleGraphAction = (action: string) => {
    if (disabled || !onGraphAction) return;

    const payload: any = { isDirected };

    const normalizeId = (val: string) => {
      const num = parseInt(val, 10);
      return isNaN(num) ? val : String(num);
    };

    if (action === "addVertex") {
      payload.value = normalizeId(inputValue);
    } else if (action === "removeVertex") {
      payload.id = normalizeId(inputValue);
    } else if (action === "addEdge" || action === "removeEdge") {
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

  return (
    <ActionBarContainer>
      <GraphLoaderModal
        show={showGraphLoader}
        onClose={() => setShowGraphLoader(false)}
        onLoad={onLoadData}
      />

      {/* 第一行：資料控制 */}
      <ActionBarGroup>
        <Tooltip content="開啟自定義 Graph 資料載入介面">
          <Button
            size="sm"
            onClick={() => setShowGraphLoader(true)}
            disabled={disabled}
          >
            載入 Graph 資料
          </Button>
        </Tooltip>
        <Tooltip content="清除所有資料，恢復初始狀態">
          <Button
            variant="secondary"
            size="sm"
            onClick={onResetData}
            disabled={disabled}
            icon="rotate-right"
          >
            重設
          </Button>
        </Tooltip>
        <Tooltip content="隨機生成一組圖形資料">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRandomData()}
            disabled={disabled}
            icon="shuffle"
          >
            隨機
          </Button>
        </Tooltip>

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
                  DATA_LIMITS.MAX_NODES
                );
                setRandomCount(v);
                setRandomCountInput(String(v));
                onMaxNodesChange?.(v);
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
      </ActionBarGroup>

      {/* 第二行：操作控制 */}
      <ActionBarGroup>
        <StaticLabel>Graph Operations</StaticLabel>

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
        <Tooltip content="新增一個節點到圖中">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("addVertex")}
            disabled={disabled}
            className={styles.btnInsert}
          >
            新增
          </Button>
        </Tooltip>
        <Tooltip content="從圖中刪除指定節點">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("removeVertex")}
            disabled={disabled}
            className={styles.btnDelete}
          >
            刪除
          </Button>
        </Tooltip>
        <Tooltip content="查詢指定節點的所有鄰居">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("getNeighbors")}
            disabled={disabled}
            className={styles.btnQuery}
          >
            找鄰居
          </Button>
        </Tooltip>
        <Tooltip content="查詢指定節點的度數">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("getDegree")}
            disabled={disabled}
            className={styles.btnQuery}
          >
            度數
          </Button>
        </Tooltip>

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
        <StaticLabel>→</StaticLabel>
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

        <Tooltip content="在兩個節點之間新增一條邊">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("addEdge")}
            disabled={disabled}
            className={styles.btnInsert}
          >
            連線
          </Button>
        </Tooltip>
        <Tooltip content="移除兩個節點之間的邊">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("removeEdge")}
            disabled={disabled}
            className={styles.btnDelete}
          >
            斷線
          </Button>
        </Tooltip>
        <Tooltip content="檢查兩個節點是否相鄰">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("checkAdjacent")}
            disabled={disabled}
            className={styles.btnQuery}
          >
            檢查
          </Button>
        </Tooltip>

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

        <Tooltip content="檢查圖是否連通">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("checkConnected")}
            disabled={disabled}
            className={styles.btnQuery}
          >
            連通性
          </Button>
        </Tooltip>
        <Tooltip content="檢查圖中是否存在環">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("checkCycle")}
            disabled={disabled}
            className={styles.btnQuery}
          >
            是否有環
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
