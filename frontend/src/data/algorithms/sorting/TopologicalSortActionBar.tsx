import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import {
  ActionBarContainer,
  ActionBarGroup,
  GraphLoaderModal,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";
import type { AlgoActionBarProps } from "@/types/implementation";

export const TopologicalSortActionBar: React.FC<AlgoActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  disabled = false,
  onRun,
}) => {
  const { t } = useTranslation("tutorials/topological-sort");
  const [showLoader, setShowLoader] = useState(false);

  return (
    <ActionBarContainer>
      <GraphLoaderModal
        show={showLoader}
        onClose={() => setShowLoader(false)}
        onLoad={onLoadData}
      />

      <ActionBarGroup>
        <Tooltip content={t("ui.loadTooltip")}>
          <Button
            size="sm"
            onClick={() => setShowLoader(true)}
            disabled={disabled}
            icon="download"
          >
            {t("ui.load")}
          </Button>
        </Tooltip>
        <Tooltip content={t("ui.resetTooltip")}>
          <Button
            variant="secondary"
            size="sm"
            onClick={onResetData}
            disabled={disabled}
            icon="rotate-right"
          >
            {t("ui.reset")}
          </Button>
        </Tooltip>
        <Tooltip content={t("ui.randomTooltip")}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRandomData()}
            disabled={disabled}
            icon="shuffle"
          >
            {t("ui.random")}
          </Button>
        </Tooltip>
      </ActionBarGroup>

      <ActionBarGroup>
        <Tooltip content={t("ui.runTooltip")}>
          <Button
            size="sm"
            onClick={() => onRun()}
            disabled={disabled}
            className={`${styles.runButton} ${styles.runButtonSearching} ${styles.btnRun}`}
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
