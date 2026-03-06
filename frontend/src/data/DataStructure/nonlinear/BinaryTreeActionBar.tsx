import React from "react";
import Button from "@/shared/components/Button";
import Tooltip from "@/shared/components/Tooltip";
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
  onLimitExceeded,
  disabled = false,
  onSearchNode,
  maxNodes,
}) => {
  return (
    <ActionBarContainer>
      <ActionBarGroup>
        <DataRow
          onLoadData={onLoadData}
          onResetData={onResetData}
          onRandomData={onRandomData}
          onMaxNodesChange={onMaxNodesChange}
          onLimitExceeded={onLimitExceeded}
          disabled={disabled}
          maxNodes={maxNodes}
        />
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>Binary Tree Traversals</StaticLabel>

        <Tooltip content="前序走訪：根 → 左 → 右">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSearchNode(0, "preorder")}
            disabled={disabled}
            className={styles.btnSearch}
          >
            Preorder
          </Button>
        </Tooltip>
        <Tooltip content="中序走訪：左 → 根 → 右">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSearchNode(0, "inorder")}
            disabled={disabled}
            className={styles.btnSearch}
          >
            Inorder
          </Button>
        </Tooltip>
        <Tooltip content="後序走訪：左 → 右 → 根">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSearchNode(0, "postorder")}
            disabled={disabled}
            className={styles.btnSearch}
          >
            Postorder
          </Button>
        </Tooltip>
        <Tooltip content="廣度優先走訪：逐層遍歷節點">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSearchNode(0, "bfs")}
            disabled={disabled}
            className={styles.btnSearch}
          >
            BFS (Level-order)
          </Button>
        </Tooltip>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
