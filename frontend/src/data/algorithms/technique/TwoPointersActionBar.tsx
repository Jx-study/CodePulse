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
  TwoPointersMode,
} from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  DataRow,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";
import { DEFAULT_TWO_POINTERS_TARGET } from "./twoPointers/simulateTrace";

const DEFAULT_MODE: TwoPointersMode = "two_sum";

function toTwoPointersMode(viewMode: AlgorithmViewMode | undefined): TwoPointersMode {
  if (viewMode === "two_sum" || viewMode === "remove_duplicates") return viewMode;
  return DEFAULT_MODE;
}

export const TwoPointersActionBar: React.FC<AlgoActionBarProps> = ({
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
  const { t } = useTranslation("tutorials/two-pointers");
  const [target, setTarget] = useState<string>(String(DEFAULT_TWO_POINTERS_TARGET));
  const currentMode = toTwoPointersMode(viewMode);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === "two_sum" || v === "remove_duplicates") {
      onViewModeChange?.(v);
    }
  };

  const handleRun = () => {
    if (currentMode === "remove_duplicates") {
      onRun({ type: "twoPointers", mode: currentMode });
      return;
    }
    const val = parseInt(target, 10);
    if (isNaN(val)) {
      toast.warning(t("ui.invalidInput"));
      return;
    }
    onRun({ type: "twoPointers", mode: currentMode, target: val });
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
              { value: "two_sum", label: t("ui.modeTwoSum") },
              { value: "remove_duplicates", label: t("ui.modeDedup") },
            ]}
            aria-label="Two pointers mode"
          />
        </div>
        {currentMode === "two_sum" && (
          <Input
            type="number"
            placeholder={t("ui.placeholder")}
            value={target}
            min={DATA_LIMITS.MIN_NODE_VALUE * 2}
            max={DATA_LIMITS.MAX_NODE_VALUE * 2}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTarget(
                clampNumberInput(
                  e.target.value,
                  DATA_LIMITS.MIN_NODE_VALUE * 2,
                  DATA_LIMITS.MAX_NODE_VALUE * 2,
                ),
              )
            }
            className={`${styles.input} ${styles.valueInput}`}
            disabled={disabled}
            fullWidth={false}
            aria-label="Target sum"
          />
        )}
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
