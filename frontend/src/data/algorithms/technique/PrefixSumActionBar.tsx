import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import { toast } from "@/shared/components/Toast";
import { DATA_LIMITS, clampNumberInput } from "@/constants/dataLimits";
import type { AlgoActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  DataRow,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const PrefixSumActionBar: React.FC<AlgoActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  disabled = false,
  onRun,
  maxNodes,
}) => {
  const { t } = useTranslation("tutorials/prefix-sum");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  const handleRun = () => {
    const start = parseInt(rangeStart);
    const end = parseInt(rangeEnd);

    if (isNaN(start) && isNaN(end)) {
      onRun({ type: "prefixSum" });
    } else if (
      !isNaN(start) &&
      !isNaN(end) &&
      start <= end &&
      start >= 0 &&
      end >= 0
    ) {
      onRun({ type: "prefixSum", range: [start, end] });
    } else {
      toast.warning(t("ui.invalidRange"));
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
        <div className={styles.rangeInput}>
          <Input
            type="number"
            placeholder="L"
            value={rangeStart}
            min={0}
            max={maxNodes !== undefined ? maxNodes - 1 : DATA_LIMITS.MAX_NODE_VALUE}
            onChange={(e) => setRangeStart(clampNumberInput(e.target.value, 0, maxNodes !== undefined ? maxNodes - 1 : DATA_LIMITS.MAX_NODE_VALUE))}
            className={`${styles.input} ${styles.valueInput}`}
            disabled={disabled}
            fullWidth={false}
            aria-label="Range start L"
          />
          <StaticLabel>-</StaticLabel>
          <Input
            type="number"
            placeholder="R"
            value={rangeEnd}
            min={0}
            max={maxNodes !== undefined ? maxNodes - 1 : DATA_LIMITS.MAX_NODE_VALUE}
            onChange={(e) => setRangeEnd(clampNumberInput(e.target.value, 0, maxNodes !== undefined ? maxNodes - 1 : DATA_LIMITS.MAX_NODE_VALUE))}
            className={`${styles.input} ${styles.valueInput}`}
            disabled={disabled}
            fullWidth={false}
            aria-label="Range end R"
          />
        </div>
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
