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
  KnapsackLoaderModal,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const KnapsackActionBar: React.FC<AlgoActionBarProps> = ({
  onLoadData,
  onResetData,
  onMaxNodesChange,
  maxNodes,
  disabled = false,
  onRun,
}) => {
  const { t } = useTranslation("tutorials/knapsack");
  const [capacity, setCapacity] = useState("5");
  const [showLoader, setShowLoader] = useState(false);
  const [itemCount, setItemCount] = useState(5);

  const handleModalLoad = (itemsStr: string) => {
    onLoadData(`KNAPSACK:${capacity}:${itemsStr}`);
  };

  const handleMaxNodesChange = (v: number) => {
    setItemCount(v);
    onMaxNodesChange?.(v);
  };

  const handleGenerateRandom = () => {
    const count = itemCount;
    const newItems = Array.from({ length: count }, () => {
      return `${Math.floor(Math.random() * 4) + 1} ${Math.floor(Math.random() * 40) + 10}`;
    }).join(",");
    onLoadData(`KNAPSACK:${capacity}:${newItems}`);
  };

  const handleRun = () => {
    const cap = parseInt(capacity);
    if (!isNaN(cap) && cap > 0) {
      if (cap > DATA_LIMITS.MAX_KNAPSACK_CAPACITY) {
        toast.warning(t("ui.limitWarning"));
        return;
      }
      onRun({ type: "knapsack", capacity: cap });
    } else {
      toast.warning(t("ui.invalidInput"));
    }
  };

  return (
    <ActionBarContainer>
      <KnapsackLoaderModal
        show={showLoader}
        onClose={() => setShowLoader(false)}
        onLoad={handleModalLoad}
      />
      <ActionBarGroup>
        <Tooltip content={t("ui.loadTooltip")}>
          <Button
            size="sm"
            onClick={() => setShowLoader(true)}
            disabled={disabled}
          >
            {t("ui.load")}
          </Button>
        </Tooltip>
        <DataRow
          hideLoadButton
          onLoadData={onLoadData}
          onResetData={onResetData}
          onRandomData={handleGenerateRandom}
          onMaxNodesChange={handleMaxNodesChange}
          maxNodes={maxNodes}
          disabled={disabled}
        />
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>{t("ui.controlLabel")}</StaticLabel>
        <Input
          type="number"
          placeholder={t("ui.placeholder")}
          value={capacity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCapacity(clampNumberInput(e.target.value, 1, DATA_LIMITS.MAX_KNAPSACK_CAPACITY))
          }
          className={styles.input}
          disabled={disabled}
          fullWidth={false}
          min={1}
          max={DATA_LIMITS.MAX_KNAPSACK_CAPACITY}
          aria-label="Knapsack capacity"
        />
        <Tooltip content={t("ui.runTooltip")}>
          <Button
            size="sm"
            onClick={handleRun}
            disabled={disabled}
            className={styles.btnRun}
            icon="play"
            variant="secondary"
          >
            {t("ui.run")}
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
