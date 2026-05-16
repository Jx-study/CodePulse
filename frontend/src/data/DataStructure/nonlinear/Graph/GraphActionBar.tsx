import React, { useState } from "react";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import Checkbox from "@/shared/components/Checkbox";
import { toast } from "@/shared/components/Toast";
import type { DSActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  DataRow,
  GraphLoaderModal,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const GraphActionBar: React.FC<DSActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  disabled = false,
  onGraphAction,
  isDirected = false,
  onIsDirectedChange,
  maxNodes,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [sourceNode, setSourceNode] = useState("");
  const [targetNode, setTargetNode] = useState("");
  const [showGraphLoader, setShowGraphLoader] = useState(false);

  const handleGraphAction = (action: string) => {
    if (disabled || !onGraphAction) return;

    const normalizeId = (val: string) => {
      const num = parseInt(val, 10);
      return isNaN(num) ? val : String(num);
    };

    const needsNodeId = ["addVertex", "removeVertex", "getNeighbors", "getDegree"];
    const needsEdge = ["addEdge", "removeEdge", "checkAdjacent"];

    if (needsNodeId.includes(action) && inputValue.trim() === "") {
      toast.warning("請輸入節點 ID");
      return;
    }
    if (needsEdge.includes(action)) {
      if (sourceNode.trim() === "") {
        toast.warning("請輸入起點 (Src) 節點 ID");
        return;
      }
      if (targetNode.trim() === "") {
        toast.warning("請輸入終點 (Dst) 節點 ID");
        return;
      }
    }

    const payload: any = { isDirected };

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
        <DataRow
          onLoadData={onLoadData}
          onResetData={onResetData}
          onRandomData={onRandomData}
          onMaxNodesChange={onMaxNodesChange}
          disabled={disabled}
          maxNodes={maxNodes}
          hideLoadButton
        />
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
            icon="plus"
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
            icon="trash"
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
            icon="search"
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
            icon="search"
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
            icon="plus"
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
            icon="trash"
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
            icon="search"
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
          aria-label="Directed graph"
          className={styles.directedCheckbox}
        />

        <Tooltip content="檢查圖是否連通">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("checkConnected")}
            disabled={disabled}
            className={styles.btnQuery}
            icon="diagram-project"
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
            icon="arrows-spin"
          >
            是否有環
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
