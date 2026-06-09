import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import { toast } from "@/shared/components/Toast";
import { DATA_LIMITS, clampNumberInput } from "@/constants/dataLimits";
import type { DSActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  DataRow,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const QueueActionBar: React.FC<DSActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  disabled = false,
  onAddNode,
  onDeleteNode,
  onPeek,
  maxNodes,
}) => {
  const { t } = useTranslation("tutorials/queue");
  const [inputValue, setInputValue] = useState("");

  const handleEnqueue = () => {
    if (disabled) return;
    if (inputValue.trim() === "") {
      toast.warning(t("ui.enqueueWarning"));
      return;
    }
    onAddNode(Number(inputValue), "Tail");
  };

  const handleDequeue = () => {
    if (disabled) return;
    onDeleteNode("Head");
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
        <StaticLabel>{t("ui.operations")}</StaticLabel>

        <Input
          type="number"
          placeholder={t("ui.valuePlaceholder")}
          value={inputValue}
          min={DATA_LIMITS.MIN_NODE_VALUE}
          max={DATA_LIMITS.MAX_NODE_VALUE}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(clampNumberInput(e.target.value, DATA_LIMITS.MIN_NODE_VALUE, DATA_LIMITS.MAX_NODE_VALUE))
          }
          className={`${styles.input} ${styles.valueInput}`}
          disabled={disabled}
          fullWidth={false}
          aria-label="Node value"
        />

        <Tooltip content={t("ui.enqueueTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleEnqueue}
            disabled={disabled}
            className={styles.btnInsert}
            icon="plus"
          >
            {t("ui.enqueue")}
          </Button>
        </Tooltip>

        <Tooltip content={t("ui.dequeueTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleDequeue}
            disabled={disabled}
            className={styles.btnDelete}
            icon="trash"
          >
            {t("ui.dequeue")}
          </Button>
        </Tooltip>

        {onPeek && (
          <Tooltip content={t("ui.peekTooltip")}>
            <Button
              size="sm"
              variant="secondary"
              onClick={onPeek}
              disabled={disabled}
              className={styles.btnQuery}
              icon="eye"
            >
              {t("ui.peek")}
            </Button>
          </Tooltip>
        )}
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
