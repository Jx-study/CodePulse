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

export const HeapActionBar: React.FC<DSActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  maxNodes,
  disabled = false,
  onCustomAction,
}) => {
  const { t } = useTranslation("tutorials/heap");
  const [inputValue, setInputValue] = useState("");
  const [isMinHeap, setIsMinHeap] = useState(false);
  const [isMaxHeap, setIsMaxHeap] = useState(true);

  const isHeapReady = isMinHeap || isMaxHeap;
  const heapLabel = isMinHeap
    ? "Min-Heap"
    : isMaxHeap
      ? "Max-Heap"
      : t("ui.notHeap");

  const markMaxHeap = () => {
    setIsMinHeap(false);
    setIsMaxHeap(true);
  };

  const markNotHeap = () => {
    setIsMinHeap(false);
    setIsMaxHeap(false);
  };

  const handleLoadData = (data: string) => {
    markNotHeap();
    onLoadData(data);
  };

  const handleResetData = () => {
    markMaxHeap();
    onResetData();
  };

  const handleRandomData = (params?: any) => {
    markNotHeap();
    onRandomData(params);
  };

  const handleToggleMode = () => {
    if (disabled || !onCustomAction) return;
    const newMode = !isMinHeap;
    setIsMinHeap(newMode);
    setIsMaxHeap(!newMode);
    onCustomAction("heapify", { isMinHeap: newMode, isMaxHeap: !newMode });
  };

  const handleInsert = () => {
    if (disabled || !onCustomAction) return;
    if (!isHeapReady) {
      toast.warning(t("ui.needHeapifyWarning"));
      return;
    }
    if (!inputValue.trim()) {
      toast.warning(t("ui.insertWarning"));
      return;
    }
    const val = parseInt(inputValue, 10);
    if (!isNaN(val)) {
      onCustomAction("add", { value: val, isMinHeap, isMaxHeap });
      setInputValue("");
    }
  };

  const handleExtract = () => {
    if (disabled || !onCustomAction) return;
    if (!isHeapReady) {
      toast.warning(t("ui.needHeapifyWarning"));
      return;
    }
    onCustomAction("delete", { isMinHeap, isMaxHeap });
  };

  const handlePeek = () => {
    if (disabled || !onCustomAction) return;
    if (!isHeapReady) {
      toast.warning(t("ui.needHeapifyWarning"));
      return;
    }
    onCustomAction("peek", { isMinHeap, isMaxHeap });
  };

  const handleHeapify = () => {
    if (disabled || !onCustomAction) return;
    setIsMaxHeap(!isMinHeap);
    onCustomAction("heapify", { isMinHeap, isMaxHeap: !isMinHeap });
  };

  return (
    <ActionBarContainer>
      <ActionBarGroup>
        <DataRow
          onLoadData={handleLoadData}
          onResetData={handleResetData}
          onRandomData={handleRandomData}
          onMaxNodesChange={onMaxNodesChange}
          disabled={disabled}
          maxNodes={maxNodes}
          minValue={DATA_LIMITS.MIN_NODE_VALUE}
          maxValue={DATA_LIMITS.MAX_NODE_VALUE}
        />
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>{heapLabel}</StaticLabel>

        <Tooltip content={t("ui.toggleTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            className={isMinHeap ? styles.btnToggleOn : styles.btnToggleOff}
            onClick={handleToggleMode}
            disabled={disabled}
            icon="rotate"
          >
            {isHeapReady
              ? t("ui.switchTo", { mode: isMinHeap ? "Max" : "Min" })
              : t("ui.buildMinHeap")}
          </Button>
        </Tooltip>

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
          onKeyDown={(e) => e.key === "Enter" && handleInsert()}
        />
        <Tooltip
          content={
            isHeapReady
              ? t("ui.insertReadyTooltip")
              : t("ui.needHeapifyTooltip")
          }
        >
          <Button
            size="sm"
            variant="secondary"
            className={styles.btnInsert}
            onClick={handleInsert}
            disabled={disabled}
            icon="plus"
          >
            {t("ui.insert")}
          </Button>
        </Tooltip>

        <Tooltip
          content={
            isHeapReady
              ? t("ui.extractReadyTooltip", {
                  type: isMinHeap ? t("ui.min") : t("ui.max"),
                })
              : t("ui.extractNeedHeapifyTooltip")
          }
        >
          <Button
            size="sm"
            variant="secondary"
            className={styles.btnDelete}
            onClick={handleExtract}
            disabled={disabled}
            icon="arrow-up-from-bracket"
          >
            {isHeapReady
              ? t("ui.extractBtn", { type: isMinHeap ? "Min" : "Max" })
              : t("ui.extract")}
          </Button>
        </Tooltip>

        <Tooltip
          content={
            isHeapReady
              ? t("ui.peekReadyTooltip", {
                  type: isMinHeap ? t("ui.min") : t("ui.max"),
                })
              : t("ui.peekNeedHeapifyTooltip")
          }
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={handlePeek}
            disabled={disabled}
            icon="eye"
          >
            {t("ui.peek")}
          </Button>
        </Tooltip>

        <Tooltip content={t("ui.heapifyTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleHeapify}
            disabled={disabled}
            icon="wand-magic-sparkles"
          >
            Heapify
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
