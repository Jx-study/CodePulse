import React from "react";
import Button from "@/shared/components/Button";
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
        />
      </ActionBarGroup>

      <ActionBarGroup>
        <StaticLabel>Binary Tree Traversals</StaticLabel>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => onSearchNode(0, "preorder")}
          disabled={disabled}
          className={styles.btnSearch}
        >
          Preorder
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onSearchNode(0, "inorder")}
          disabled={disabled}
          className={styles.btnSearch}
        >
          Inorder
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onSearchNode(0, "postorder")}
          disabled={disabled}
          className={styles.btnSearch}
        >
          Postorder
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onSearchNode(0, "bfs")}
          disabled={disabled}
          className={styles.btnSearch}
        >
          BFS (Level-order)
        </Button>
      </ActionBarGroup>
    </ActionBarContainer>
  );
};
