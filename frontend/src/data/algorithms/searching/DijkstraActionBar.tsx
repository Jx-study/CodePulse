import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Checkbox from "@/shared/components/Checkbox";
import Input from "@/shared/components/Input";
import { toast } from "@/shared/components/Toast";
import { DATA_LIMITS, clampNumberInput } from "@/constants/dataLimits";
import type { AlgoActionBarProps } from "@/types/implementation";
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
  disabled = false,
  onRun,
  isDirected = false,
  onIsDirectedChange,
  currentData,
}) => {
  const { t } = useTranslation("tutorials/dijkstra");
  const [showGraphLoader, setShowGraphLoader] = useState(false);
  const [graphStartElement, setGraphStartElement] = useState("");
  const [graphEndElement, setGraphEndElement] = useState("");

  const normalizeId = (val: string) => {
    const num = parseInt(val, 10);
    return isNaN(num) ? val : String(num);
  };

  const handleRun = () => {
    let startId, endId;
    if (graphStartElement !== "" || graphEndElement !== "") {
      if (!currentData || !(currentData as any).nodes) {
        toast.warning(t("ui.noGraphData"));
        return;
      }
      const nodes = (currentData as any).nodes as { id: string }[];

      if (graphStartElement !== "") {
        const targetId = `node-${normalizeId(graphStartElement)}`;
        if (!nodes.find((n) => n.id === targetId)) {
          toast.warning(
            t("ui.startNodeNotFound", { val: normalizeId(graphStartElement) }),
          );
          return;
        }
        startId = targetId;
      }

      if (graphEndElement !== "") {
        const targetId = `node-${normalizeId(graphEndElement)}`;
        if (!nodes.find((n) => n.id === targetId)) {
          toast.warning(
            t("ui.endNodeNotFound", { val: normalizeId(graphEndElement) }),
          );
          return;
        }
        endId = targetId;
      }
    }
    onRun({
      type: "dijkstra",
      mode: "graph",
      startNode: startId,
      endNode: endId,
      isDirected,
    });
  };

  return (
    <ActionBarContainer>
      <GraphLoaderModal
        show={showGraphLoader}
        onClose={() => setShowGraphLoader(false)}
        onLoad={onLoadData}
        isWeighted={true}
      />

      <ActionBarGroup>
        <Tooltip content={t("ui.loadGraphTooltip")}>
          <Button
            size="sm"
            onClick={() => setShowGraphLoader(true)}
            disabled={disabled}
          >
            {t("ui.loadGraph")}
          </Button>
        </Tooltip>
        <Tooltip content={t("ui.resetTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={onResetData}
            disabled={disabled}
            icon="rotate-right"
          >
            {t("ui.reset")}
          </Button>
        </Tooltip>
        <Tooltip content={t("ui.randomTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onRandomData()}
            disabled={disabled}
            icon="shuffle"
          >
            {t("ui.random")}
          </Button>
        </Tooltip>
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>Dijkstra Control</StaticLabel>
        <div className={styles.startEndContainer}>
          <Input
            type="number"
            placeholder={t("ui.startPlaceholder")}
            value={graphStartElement}
            fullWidth={false}
            min={0}
            max={DATA_LIMITS.MAX_GRAPH_NODE_ID}
            onChange={(e) => setGraphStartElement(clampNumberInput(e.target.value, 0, DATA_LIMITS.MAX_GRAPH_NODE_ID))}
            className={`${styles.input} ${styles.startEndInput}`}
            disabled={disabled}
            aria-label="Start node"
          />
          <span className={styles.startEndSeparator}>-</span>
          <Input
            type="number"
            placeholder={t("ui.endPlaceholder")}
            value={graphEndElement}
            fullWidth={false}
            min={0}
            max={DATA_LIMITS.MAX_GRAPH_NODE_ID}
            onChange={(e) => setGraphEndElement(clampNumberInput(e.target.value, 0, DATA_LIMITS.MAX_GRAPH_NODE_ID))}
            className={`${styles.input} ${styles.startEndInput}`}
            disabled={disabled}
            aria-label="End node"
          />
        </div>

        <Checkbox
          label={t("ui.isDirected")}
          checked={isDirected}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onIsDirectedChange && onIsDirectedChange(e.target.checked)
          }
          disabled={disabled}
          aria-label="Directed graph"
        />

        <Tooltip content={t("ui.runTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRun}
            disabled={disabled}
            className={styles.btnRun}
            icon="play"
          >
            {t("ui.run")}
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
