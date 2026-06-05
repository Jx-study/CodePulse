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

export const ArrayActionBar: React.FC<DSActionBarProps> = ({
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
  const { t } = useTranslation("tutorials/array");
  const [inputValue, setInputValue] = useState("");
  const [indexValue, setIndexValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const handleInsert = () => {
    if (disabled) return;
    if (inputValue.trim() === "") {
      toast.warning(t("ui.insertWarning"));
      return;
    }
    const val = Number(inputValue);
    const idx = indexValue.trim() !== "" ? Number(indexValue) : undefined;
    onAddNode(val, "Insert", idx);
  };

  const handleUpdate = () => {
    if (disabled) return;
    if (inputValue.trim() === "") {
      toast.warning(t("ui.updateWarning"));
      return;
    }
    const val = Number(inputValue);
    const idx = indexValue.trim() !== "" ? Number(indexValue) : undefined;
    if (idx !== undefined) {
      onAddNode(val, "Update", idx);
    } else {
      toast.warning(t("ui.updateWarning"));
    }
  };

  const handleDelete = () => {
    if (disabled) return;
    if (indexValue.trim() === "") {
      toast.warning(t("ui.deleteWarning"));
      return;
    }
    const idx = Number(indexValue);
    onDeleteNode("Insert", idx);
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

        <Input
          type="number"
          placeholder={t("ui.indexPlaceholder")}
          value={indexValue}
          min={0}
          max={maxNodes !== undefined ? maxNodes - 1 : 99}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setIndexValue(clampNumberInput(e.target.value, 0, maxNodes !== undefined ? maxNodes - 1 : 99))
          }
          className={`${styles.input} ${styles.valueInput}`}
          disabled={disabled}
          fullWidth={false}
          aria-label="Index"
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

        <Tooltip content={t("ui.updateTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleUpdate}
            disabled={disabled}
            className={styles.btnUpdate}
            icon="pencil"
          >
            {t("ui.update")}
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
              const val = Number(searchValue);
              onSearchNode(val, "search");
            }}
            disabled={disabled}
            className={styles.btnSearch}
            icon="search"
          >
            {t("ui.search")}
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
