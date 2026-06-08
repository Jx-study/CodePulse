import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
import Select from "@/shared/components/Select";
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

export const LinkedListActionBar: React.FC<DSActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  disabled = false,
  onAddNode,
  onDeleteNode,
  onSearchNode,
  onTailModeChange,
  onListModeChange,
  hasTailMode = false,
  listMode = "singly",
  maxNodes,
}) => {
  const { t } = useTranslation("tutorials/linked-list");
  const [inputValue, setInputValue] = useState("");
  const [indexValue, setIndexValue] = useState("");
  const [insertMode, setInsertMode] = useState("Head");
  const [searchValue, setSearchValue] = useState("");

  const showIndexInput = insertMode === "Node N";

  const handleAdd = () => {
    if (disabled) return;
    if (inputValue.trim() === "") {
      toast.warning(t("ui.insertWarning"));
      return;
    }
    if (insertMode === "Node N" && indexValue.trim() === "") {
      toast.warning(t("ui.indexWarning"));
      return;
    }
    const idx = indexValue.trim() !== "" ? Number(indexValue) : undefined;
    onAddNode(Number(inputValue), insertMode, idx);
  };

  const handleDelete = () => {
    if (disabled) return;
    if (insertMode === "Node N" && indexValue.trim() === "") {
      toast.warning(t("ui.indexWarning"));
      return;
    }
    const idx = indexValue.trim() !== "" ? Number(indexValue) : undefined;
    onDeleteNode(insertMode, idx);
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
        {onListModeChange && (
          <Select
            size="sm"
            value={listMode}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onListModeChange(e.target.value as "singly" | "doubly")
            }
            className={styles.select}
            disabled={disabled}
            options={[
              { value: "singly", label: t("ui.singly") },
              { value: "doubly", label: t("ui.doubly") },
            ]}
            aria-label="List mode selection"
          />
        )}
        {onTailModeChange && (
          <Select
            size="sm"
            value={hasTailMode ? "hasTail" : "noTail"}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onTailModeChange(e.target.value === "hasTail")
            }
            className={styles.select}
            disabled={disabled}
            options={[
              { value: "noTail", label: t("ui.noTail") },
              { value: "hasTail", label: t("ui.hasTail") },
            ]}
            aria-label="Tail mode selection"
          />
        )}
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>{t("ui.operations")}</StaticLabel>

        <Select
          size="sm"
          value={insertMode}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setInsertMode(e.target.value)
          }
          className={styles.select}
          disabled={disabled}
          options={[
            { value: "Head", label: "Head" },
            { value: "Tail", label: "Tail" },
            { value: "Node N", label: "Node N" },
          ]}
          aria-label="Insert mode"
        />

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

        {showIndexInput && (
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
        )}

        <Tooltip content={t("ui.insertTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleAdd}
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
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
