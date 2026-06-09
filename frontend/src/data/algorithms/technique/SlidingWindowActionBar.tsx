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
  SlidingWindowMode,
} from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  DataRow,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

const DEFAULT_SLIDING_MODE: SlidingWindowMode = "longest_lte";

function toSlidingWindowMode(
  viewMode: AlgorithmViewMode | undefined,
): SlidingWindowMode {
  if (viewMode === "longest_lte" || viewMode === "shortest_gte")
    return viewMode;
  return DEFAULT_SLIDING_MODE;
}

export const SlidingWindowActionBar: React.FC<AlgoActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  disabled = false,
  onRun,
  maxNodes,
  viewMode,
  onViewModeChange,
}) => {
  const { t } = useTranslation("tutorials/sliding-window");
  const [targetSum, setTargetSum] = useState<string>("20");
  const currentMode = toSlidingWindowMode(viewMode);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === "longest_lte" || v === "shortest_gte") {
      onViewModeChange?.(v);
    }
  };

  const handleRun = () => {
    const val = parseInt(targetSum, 10);
    if (!isNaN(val)) {
      onRun({ type: "slidingWindow", mode: currentMode, targetSum: val });
    } else {
      toast.warning(t("ui.invalidInput"));
    }
  };

  return (
    <ActionBarContainer>
      <ActionBarGroup>
        <DataRow
          onLoadData={onLoadData}
          onResetData={onResetData}
          onRandomData={onRandomData}
          onMaxNodesChange={onMaxNodesChange}
          disabled={disabled}
          maxNodes={maxNodes}
          minValue={DATA_LIMITS.MIN_NODE_VALUE}
          maxValue={DATA_LIMITS.MAX_NODE_VALUE}
        />
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>{t("ui.controlLabel")}</StaticLabel>
        <div className={styles.viewModeContainer}>
          <span className={styles.viewModeLabel}>{t("ui.modeLabel")}:</span>
          <Select
            value={currentMode}
            onChange={handleModeChange}
            disabled={disabled}
            size="sm"
            fullWidth={false}
            className={styles.viewModeSelect}
            options={[
              { value: "longest_lte", label: t("ui.modeLongest") },
              { value: "shortest_gte", label: t("ui.modeShortest") },
            ]}
            aria-label="Window mode"
          />
        </div>
        <Input
          type="number"
          placeholder={t("ui.placeholder")}
          value={targetSum}
          min={DATA_LIMITS.MIN_NODE_VALUE}
          max={DATA_LIMITS.MAX_NODE_VALUE}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTargetSum(clampNumberInput(e.target.value, DATA_LIMITS.MIN_NODE_VALUE, DATA_LIMITS.MAX_NODE_VALUE))
          }
          className={`${styles.input} ${styles.valueInput}`}
          disabled={disabled}
          fullWidth={false}
          aria-label="Target sum"
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
