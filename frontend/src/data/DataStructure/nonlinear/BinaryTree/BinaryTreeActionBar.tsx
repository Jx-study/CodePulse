import React from "react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
import { DATA_LIMITS } from "@/constants/dataLimits";
import type { DSActionBarProps } from "@/types/implementation";
import {
  ActionBarContainer,
  ActionBarGroup,
  DataRow,
  StaticLabel,
  styles,
} from "@/modules/core/components/ActionBar/ActionBarCommon";

export const BinaryTreeActionBar: React.FC<DSActionBarProps> = ({
  onLoadData,
  onResetData,
  onRandomData,
  onMaxNodesChange,
  disabled = false,
  onSearchNode,
  maxNodes,
}) => {
  const { t } = useTranslation("tutorials/binary-tree");

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

        <Tooltip content={t("ui.preorderTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSearchNode(0, "preorder")}
            disabled={disabled}
            className={styles.btnSearch}
          >
            {t("ui.preorder")}
          </Button>
        </Tooltip>
        <Tooltip content={t("ui.inorderTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSearchNode(0, "inorder")}
            disabled={disabled}
            className={styles.btnSearch}
          >
            {t("ui.inorder")}
          </Button>
        </Tooltip>
        <Tooltip content={t("ui.postorderTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSearchNode(0, "postorder")}
            disabled={disabled}
            className={styles.btnSearch}
          >
            {t("ui.postorder")}
          </Button>
        </Tooltip>
        <Tooltip content={t("ui.bfsTooltip")}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSearchNode(0, "bfs")}
            disabled={disabled}
            className={styles.btnSearch}
          >
            {t("ui.bfs")}
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
