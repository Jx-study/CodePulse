import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import Select from "@/shared/components/Select";
import { toast } from "@/shared/components/Toast";
import { DATA_LIMITS, clampNumberInput } from "@/constants/dataLimits";
import type {
  AlgoActionBarProps,
  AlgorithmViewMode,
} from "@/types/implementation";
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
  disabled = false,
  onRun,
  viewMode = "graph",
  onViewModeChange,
  currentData,
}) => {
  const { t } = useTranslation("tutorials/bfs-dfs-actionbar");
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

  const handleGridLoad = (data: string) => {
    if (data.startsWith("GRID:")) {
      const parts = data.split(":");
      const cols = parseInt(parts[1], 10);
      if (parts.length >= 3 && !isNaN(cols) && cols > 0) {
        const cellCount = parts[2].split(",").length;
        const rows = Math.ceil(cellCount / cols);
        setGridCols(String(cols));
        setGridRows(String(rows));
      }
    }
    onLoadData(data);
  };

  const handleRun = () => {
    if (viewMode === "grid") {
      let startId, endId;
      if (gridStartElement !== "" || gridEndElement !== "") {
        if (!currentData || !Array.isArray(currentData)) {
          toast.warning(t("noGraphData"));
          return;
        }
        const maxIndex = currentData.length - 1;

        if (gridStartElement !== "") {
          const s = parseInt(gridStartElement, 10);
          if (isNaN(s) || s < 0 || s > maxIndex) {
            toast.warning(t("startOutOfRange", { s, maxIndex }));
            return;
          }
          if (currentData[s].val === "wall") {
            toast.warning(t("startIsWall", { s }));
            return;
          }
          startId = s.toString();
        }

        if (gridEndElement !== "") {
          const e = parseInt(gridEndElement, 10);
          if (isNaN(e) || e < 0 || e > maxIndex) {
            toast.warning(t("endOutOfRange", { e, maxIndex }));
            return;
          }
          if (currentData[e].val === "wall") {
            toast.warning(t("endIsWall", { e }));
            return;
          }
          endId = e.toString();
        }
      }
      onRun({
        type: "bfsDfs",
        mode: "grid",
        rows: parseInt(gridRows) || 3,
        cols: parseInt(gridCols) || 5,
        startNode: startId,
        endNode: endId,
      });
    } else {
      let startId, endId;
      if (graphStartElement !== "" || graphEndElement !== "") {
        if (!currentData || !(currentData as any).nodes) {
          toast.warning(t("noGraphData"));
          return;
        }
        const nodes = (currentData as any).nodes as { id: string }[];
        if (graphStartElement !== "") {
          const targetId = `node-${normalizeId(graphStartElement)}`;
          if (!nodes.find((n) => n.id === targetId)) {
            toast.warning(
              t("startNodeNotFound", { val: normalizeId(graphStartElement) }),
            );
            return;
          }
          startId = targetId;
        }
        if (graphEndElement !== "") {
          const targetId = `node-${normalizeId(graphEndElement)}`;
          if (!nodes.find((n) => n.id === targetId)) {
            toast.warning(
              t("endNodeNotFound", { val: normalizeId(graphEndElement) }),
            );
            return;
          }
          endId = targetId;
        }
      }
      onRun({
        type: "bfsDfs",
        mode: "graph",
        startNode: startId,
        endNode: endId,
      });
    }
  };

  return (
    <ActionBarContainer>
      <GridLoaderModal
        show={showGridLoader}
        onClose={() => setShowGridLoader(false)}
        onLoad={handleGridLoad}
      />
      <GraphLoaderModal
        show={showGraphLoader}
        onClose={() => setShowGraphLoader(false)}
        onLoad={onLoadData}
      />

      <ActionBarGroup>
        {viewMode === "grid" && (
          <Tooltip content={t("loadGridTooltip")}>
            <Button
              size="sm"
              onClick={() => setShowGridLoader(!showGridLoader)}
              disabled={disabled}
            >
              {t("loadGrid")}
            </Button>
          </Tooltip>
        )}
        {viewMode === "graph" && (
          <Tooltip content={t("loadGraphTooltip")}>
            <Button
              size="sm"
              onClick={() => setShowGraphLoader(true)}
              disabled={disabled}
            >
              {t("loadGraph")}
            </Button>
          </Tooltip>
        )}
        <Tooltip content={t("resetTooltip")}>
          <Button
            variant="secondary"
            size="sm"
            onClick={onResetData}
            disabled={disabled}
            icon="rotate-right"
          >
            {t("reset")}
          </Button>
        </Tooltip>
        <Tooltip content={t("randomTooltip")}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              viewMode === "grid" ? handleRandomGrid() : onRandomData()
            }
            disabled={disabled}
            icon="shuffle"
          >
            {t("random")}
          </Button>
        </Tooltip>
        {viewMode === "grid" && (
          <div className={styles.gridRowsColsContainer}>
            <label className={styles.smallLabel}>R:</label>
            <Input
              type="number"
              min={1}
              max={DATA_LIMITS.MAX_GRID_SIZE}
              value={gridRows}
              fullWidth={false}
              onChange={(e) => setGridRows(clampNumberInput(e.target.value, 1, DATA_LIMITS.MAX_GRID_SIZE))}
              className={`${styles.input} ${styles.gridRowColInput}`}
              aria-label="Grid rows"
            />
            <label className={styles.smallLabel}>C:</label>
            <Input
              type="number"
              min={1}
              max={DATA_LIMITS.MAX_GRID_SIZE}
              value={gridCols}
              fullWidth={false}
              onChange={(e) => setGridCols(clampNumberInput(e.target.value, 1, DATA_LIMITS.MAX_GRID_SIZE))}
              className={`${styles.input} ${styles.gridRowColInput}`}
              aria-label="Grid cols"
            />
          </div>
        )}
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>{t("operations")}</StaticLabel>
        <div className={styles.viewModeContainer}>
          <span className={styles.viewModeLabel}>{t("viewMode")}:</span>
          <Select
            value={viewMode}
            onChange={(e) =>
              onViewModeChange?.(e.target.value as AlgorithmViewMode)
            }
            disabled={disabled}
            size="sm"
            fullWidth={false}
            className={styles.viewModeSelect}
            options={[
              { value: "graph", label: "Graph" },
              { value: "grid", label: "Grid" },
            ]}
            aria-label="View mode"
          />
        </div>

        <div className={styles.startEndContainer}>
          <Input
            type="number"
            placeholder={t("startPlaceholder")}
            value={viewMode === "graph" ? graphStartElement : gridStartElement}
            fullWidth={false}
            min={0}
            max={DATA_LIMITS.MAX_GRAPH_NODE_ID}
            onChange={(e) => {
              const v = clampNumberInput(e.target.value, 0, DATA_LIMITS.MAX_GRAPH_NODE_ID);
              viewMode === "graph" ? setGraphStartElement(v) : setGridStartElement(v);
            }}
            className={`${styles.input} ${styles.startEndInput}`}
            disabled={disabled}
            aria-label="Start node"
          />
          <span className={styles.startEndSeparator}>-</span>
          <Input
            type="number"
            placeholder={t("endPlaceholder")}
            value={viewMode === "graph" ? graphEndElement : gridEndElement}
            fullWidth={false}
            min={0}
            max={DATA_LIMITS.MAX_GRAPH_NODE_ID}
            onChange={(e) => {
              const v = clampNumberInput(e.target.value, 0, DATA_LIMITS.MAX_GRAPH_NODE_ID);
              viewMode === "graph" ? setGraphEndElement(v) : setGridEndElement(v);
            }}
            className={`${styles.input} ${styles.startEndInput}`}
            disabled={disabled}
            aria-label="End node"
          />
        </div>

        <Tooltip content={t("runTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRun}
            disabled={disabled}
            className={styles.btnRun}
          >
            {t("run")}
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
