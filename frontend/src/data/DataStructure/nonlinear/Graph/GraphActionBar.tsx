import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("tutorials/graph");
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

    const needsNodeId = [
      "addVertex",
      "removeVertex",
      "getNeighbors",
      "getDegree",
    ];
    const needsEdge = ["addEdge", "removeEdge", "checkAdjacent"];

    if (needsNodeId.includes(action) && inputValue.trim() === "") {
      toast.warning(t("ui.requireNodeId"));
      return;
    }
    if (needsEdge.includes(action)) {
      if (sourceNode.trim() === "") {
        toast.warning(t("ui.requireSourceId"));
        return;
      }
      if (targetNode.trim() === "") {
        toast.warning(t("ui.requireTargetId"));
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
        <Tooltip content={t("ui.loadTooltip")}>
          <Button
            size="sm"
            onClick={() => setShowGraphLoader(true)}
            disabled={disabled}
          >
            {t("ui.load")}
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
        <StaticLabel>{t("ui.operations")}</StaticLabel>

        <span className={styles.smallLabel}>{t("ui.nodeLabel")}:</span>
        <Input
          placeholder="ID"
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={`${styles.input} ${styles.nodeCountInput}`}
          disabled={disabled}
          fullWidth={false}
        />
        <Tooltip content={t("ui.addVertexTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("addVertex")}
            disabled={disabled}
            className={styles.btnInsert}
            icon="plus"
          >
            {t("ui.add")}
          </Button>
        </Tooltip>
        <Tooltip content={t("ui.removeVertexTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("removeVertex")}
            disabled={disabled}
            className={styles.btnDelete}
            icon="trash"
          >
            {t("ui.remove")}
          </Button>
        </Tooltip>
        <Tooltip content={t("ui.getNeighborsTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("getNeighbors")}
            disabled={disabled}
            className={styles.btnQuery}
            icon="search"
          >
            {t("ui.neighbors")}
          </Button>
        </Tooltip>
        <Tooltip content={t("ui.getDegreeTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("getDegree")}
            disabled={disabled}
            className={styles.btnQuery}
            icon="search"
          >
            {t("ui.degree")}
          </Button>
        </Tooltip>

        <span className={styles.smallLabel}>{t("ui.edgeLabel")}:</span>
        <Input
          placeholder="Src"
          type="number"
          value={sourceNode}
          onChange={(e) => setSourceNode(e.target.value)}
          className={`${styles.input} ${styles.gridRowColInput}`}
          disabled={disabled}
          fullWidth={false}
        />
        <StaticLabel>→</StaticLabel>
        <Input
          placeholder="Dst"
          type="number"
          value={targetNode}
          onChange={(e) => setTargetNode(e.target.value)}
          className={`${styles.input} ${styles.gridRowColInput}`}
          disabled={disabled}
          fullWidth={false}
        />

        <Tooltip content={t("ui.addEdgeTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("addEdge")}
            disabled={disabled}
            className={styles.btnInsert}
            icon="plus"
          >
            {t("ui.link")}
          </Button>
        </Tooltip>
        <Tooltip content={t("ui.removeEdgeTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("removeEdge")}
            disabled={disabled}
            className={styles.btnDelete}
            icon="trash"
          >
            {t("ui.unlink")}
          </Button>
        </Tooltip>
        <Tooltip content={t("ui.checkAdjacentTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("checkAdjacent")}
            disabled={disabled}
            className={styles.btnQuery}
            icon="search"
          >
            {t("ui.adjacent")}
          </Button>
        </Tooltip>

        <Checkbox
          label={t("ui.isDirected")}
          checked={isDirected}
          onChange={(e) =>
            onIsDirectedChange && onIsDirectedChange(e.target.checked)
          }
          disabled={disabled}
          className={styles.directedCheckbox}
        />
        <Tooltip content={t("ui.checkConnectedTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("checkConnected")}
            disabled={disabled}
            className={styles.btnQuery}
            icon="diagram-project"
          >
            {t("ui.connected")}
          </Button>
        </Tooltip>
        <Tooltip content={t("ui.checkCycleTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleGraphAction("checkCycle")}
            disabled={disabled}
            className={styles.btnQuery}
            icon="arrows-spin"
          >
            {t("ui.cycle")}
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
