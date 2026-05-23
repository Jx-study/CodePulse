import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import { toast } from "@/shared/components/Toast";
import type { DSActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  DataRow,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const StackActionBar: React.FC<DSActionBarProps> = ({
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
  const { t } = useTranslation("tutorials/stack");
  const [inputValue, setInputValue] = useState("");

  const handlePush = () => {
    if (disabled) return;
    if (inputValue.trim() === "") {
      toast.warning(t("ui.pushWarning"));
      return;
    }
    onAddNode(Number(inputValue), "Head");
  };

  const handlePop = () => {
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
        />
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>{t("ui.operations")}</StaticLabel>

        <Input
          type="number"
          placeholder={t("ui.valuePlaceholder")}
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(e.target.value)
          }
          className={`${styles.input} ${styles.valueInput}`}
          disabled={disabled}
          fullWidth={false}
          aria-label="Node value"
        />

        <Tooltip content={t("ui.pushTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={handlePush}
            disabled={disabled}
            className={styles.btnInsert}
            icon="plus"
          >
            {t("ui.push")}
          </Button>
        </Tooltip>

        <Tooltip content={t("ui.popTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={handlePop}
            disabled={disabled}
            className={styles.btnDelete}
            icon="trash"
          >
            {t("ui.pop")}
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
