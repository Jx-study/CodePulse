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
import { AVL_OPS, type AVLOpGroup, type AVLOpId } from "./ops";

const OP_ICON: Partial<Record<AVLOpId, string>> = {
  insert: "plus",
  delete: "trash",
  search: "search",
};

const OP_STYLE: Partial<Record<AVLOpId, string>> = {
  insert: styles.btnInsert,
  delete: styles.btnDelete,
  search: styles.btnSearch,
};

const ROWS: { groups: AVLOpGroup[]; labelKey: string }[] = [
  { groups: ["modify", "query"], labelKey: "ui.operations" },
  { groups: ["balance"], labelKey: "ui.group.balance" },
];

export const AVLTreeActionBar: React.FC<DSActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  disabled = false,
  onAddNode,
  onDeleteNode,
  onSearchNode,
  onCustomAction,
  maxNodes,
}) => {
  const { t } = useTranslation("tutorials/avl-tree");
  const [inputValue, setInputValue] = useState("");
  const [rotateValue, setRotateValue] = useState("");

  const rotate = (action: "rotateLeft" | "rotateRight") => {
    if (rotateValue.trim() === "") {
      toast.warning(t("ui.rotateWarning"));
      return;
    }
    onCustomAction?.(action, { value: Number(rotateValue) });
  };

  const limitTo = (set: (value: string) => void) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) =>
    set(
      clampNumberInput(
        e.target.value,
        DATA_LIMITS.MIN_NODE_VALUE,
        DATA_LIMITS.MAX_NODE_VALUE,
      ),
    );

  const handlers: Partial<Record<AVLOpId, () => void>> = {
    insert: () => {
      if (inputValue.trim() === "") {
        toast.warning(t("ui.insertWarning"));
        return;
      }
      onAddNode(Number(inputValue), "Insert");
    },
    delete: () => {
      if (inputValue.trim() === "") {
        toast.warning(t("ui.deleteWarning"));
        return;
      }
      onDeleteNode("Delete", Number(inputValue));
    },
    search: () => {
      if (inputValue.trim() === "") {
        toast.warning(t("ui.searchWarning"));
        return;
      }
      onSearchNode(Number(inputValue), "Search");
    },
    checkBalance: () => onCustomAction?.("checkBalance", {}),
    rebalance: () => onCustomAction?.("rebalance", {}),
    rotateLeft: () => rotate("rotateLeft"),
    rotateRight: () => rotate("rotateRight"),
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

      {ROWS.map((row, index) => (
        <ActionBarGroup key={row.groups.join("-")}>
          <StaticLabel>{t(row.labelKey)}</StaticLabel>
          <Input
            type="number"
            placeholder={t(
              index === 0 ? "ui.valuePlaceholder" : "ui.rotatePlaceholder",
            )}
            value={index === 0 ? inputValue : rotateValue}
            min={DATA_LIMITS.MIN_NODE_VALUE}
            max={DATA_LIMITS.MAX_NODE_VALUE}
            onChange={limitTo(index === 0 ? setInputValue : setRotateValue)}
            className={`${styles.input} ${styles.valueInput}`}
            disabled={disabled}
            fullWidth={false}
            aria-label={index === 0 ? "Node value" : "Rotate value"}
          />
          {AVL_OPS.filter((op) => row.groups.includes(op.group)).map((op) => (
            <Tooltip
              key={op.id}
              content={
                op.implemented ? t(`ui.${op.id}Tooltip`) : t("ui.comingSoon")
              }
            >
              <Button
                size="sm"
                variant="secondary"
                disabled={disabled || !op.implemented}
                onClick={handlers[op.id]}
                className={OP_STYLE[op.id] ?? styles.btnQuery}
                icon={OP_ICON[op.id]}
              >
                {t(`ui.${op.id}`)}
              </Button>
            </Tooltip>
          ))}
        </ActionBarGroup>
      ))}
    </ActionBarContainer>
  );
};
