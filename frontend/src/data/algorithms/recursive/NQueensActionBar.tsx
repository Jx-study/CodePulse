import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import { toast } from "@/shared/components/Toast";
import type { AlgoActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const NQueensActionBar: React.FC<AlgoActionBarProps> = ({
  onLoadData,
  onResetData,
  disabled = false,
  onRun,
}) => {
  const { t } = useTranslation("tutorials/n-queens");
  const [nSize, setNSize] = useState("4");

  const handleNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNSize(val);

    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 1 && n <= 8) {
      onLoadData(`NQUEENS:${n}`);
    }
  };

  const handleRun = () => {
    const n = parseInt(nSize);
    if (!isNaN(n) && n >= 1) {
      if (n > 8) {
        toast.warning(t("ui.limitWarning"));
        return;
      }
      onRun({ type: "nQueens", nQueensCount: n });
    } else {
      toast.warning(t("ui.invalidInput"));
    }
  };

  return (
    <ActionBarContainer>
      <ActionBarGroup>
        <StaticLabel>{t("ui.controlLabel")}</StaticLabel>
        <Input
          type="number"
          placeholder={t("ui.placeholder")}
          value={nSize}
          onChange={handleNChange}
          className={styles.input}
          disabled={disabled}
          fullWidth={false}
          min={1}
          max={8}
          aria-label="Board size N"
        />

        <Tooltip content={t("ui.runTooltip")}>
          <Button
            size="sm"
            onClick={handleRun}
            disabled={disabled}
            className={`${styles.runButton} ${styles.runButtonSearching}`}
            icon="play"
          >
            {t("ui.run")}
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
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
