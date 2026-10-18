import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import Input from "@/shared/components/Input";
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
  { groups: ["traversal"], labelKey: "ui.group.traversal" },
  { groups: ["balance"], labelKey: "ui.group.balance" },
];

export const AVLTreeActionBar: React.FC<DSActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  disabled = false,
  maxNodes,
}) => {
  const { t } = useTranslation("tutorials/avl-tree");
  const [inputValue, setInputValue] = useState("");

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
          {index === 0 && (
            <Input
              type="number"
              placeholder={t("ui.valuePlaceholder")}
              value={inputValue}
              min={DATA_LIMITS.MIN_NODE_VALUE}
              max={DATA_LIMITS.MAX_NODE_VALUE}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInputValue(
                  clampNumberInput(
                    e.target.value,
                    DATA_LIMITS.MIN_NODE_VALUE,
                    DATA_LIMITS.MAX_NODE_VALUE,
                  ),
                )
              }
              className={`${styles.input} ${styles.valueInput}`}
              disabled={disabled}
              fullWidth={false}
              aria-label="Node value"
            />
          )}
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
