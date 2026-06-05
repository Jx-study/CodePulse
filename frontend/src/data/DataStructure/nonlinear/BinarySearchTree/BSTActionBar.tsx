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

export const BSTActionBar: React.FC<DSActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  disabled = false,
  onAddNode,
  onDeleteNode,
  onSearchNode,
  maxNodes,
}) => {
  const { t } = useTranslation("tutorials/bst");
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const handleInsert = () => {
    if (disabled) return;
    if (inputValue.trim() === "") {
      toast.warning(t("ui.insertWarning"));
      return;
    }
    onAddNode(Number(inputValue), "Insert");
  };

  const handleDelete = () => {
    if (disabled) return;
    if (inputValue.trim() === "") {
      toast.warning(t("ui.deleteWarning"));
      return;
    }
    onDeleteNode("DeleteValue", Number(inputValue));
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

        <Tooltip content={t("ui.insertTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleInsert}
            disabled={disabled}
            className={styles.btnInsert}
            icon="plus"
          >
            {t("ui.insert")}
          </Button>
        </Tooltip>

        <Tooltip content={t("ui.deleteTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleDelete}
            disabled={disabled}
            className={styles.btnDelete}
            icon="trash"
          >
            {t("ui.delete")}
          </Button>
        </Tooltip>

        <Input
          type="number"
          placeholder={t("ui.searchPlaceholder")}
          value={searchValue}
          min={DATA_LIMITS.MIN_NODE_VALUE}
          max={DATA_LIMITS.MAX_NODE_VALUE}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchValue(clampNumberInput(e.target.value, DATA_LIMITS.MIN_NODE_VALUE, DATA_LIMITS.MAX_NODE_VALUE))
          }
          className={`${styles.input} ${styles.valueInput}`}
          disabled={disabled}
          fullWidth={false}
          aria-label="Search value"
        />
        <Tooltip content={t("ui.searchTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              if (searchValue.trim() === "") {
                toast.warning(t("ui.searchWarning"));
                return;
              }
              onSearchNode(Number(searchValue), "search");
            }}
            disabled={disabled}
            className={styles.btnSearch}
            icon="search"
          >
            {t("ui.search")}
          </Button>
        </Tooltip>

        <Tooltip content={t("ui.minTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSearchNode(0, "min")}
            disabled={disabled}
            className={styles.btnQuery}
          >
            {t("ui.min")}
          </Button>
        </Tooltip>
        <Tooltip content={t("ui.maxTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSearchNode(0, "max")}
            disabled={disabled}
            className={styles.btnQuery}
          >
            {t("ui.max")}
          </Button>
        </Tooltip>
        <Tooltip content={t("ui.floorTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              if (searchValue.trim() === "") {
                toast.warning(t("ui.floorWarning"));
                return;
              }
              onSearchNode(Number(searchValue), "floor");
            }}
            disabled={disabled}
            className={styles.btnQuery}
          >
            {t("ui.floor")}
          </Button>
        </Tooltip>
        <Tooltip content={t("ui.ceilTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              if (searchValue.trim() === "") {
                toast.warning(t("ui.ceilWarning"));
                return;
              }
              onSearchNode(Number(searchValue), "ceil");
            }}
            disabled={disabled}
            className={styles.btnQuery}
          >
            {t("ui.ceil")}
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
