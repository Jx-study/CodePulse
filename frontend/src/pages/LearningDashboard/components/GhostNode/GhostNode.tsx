import React from "react";
import styles from "./GhostNode.module.scss";
import Icon from "@/shared/components/Icon";
import type { GhostNodeProps } from "@/types";

function GhostNode({
  targetLevelId,
  label,
  position,
  onClick,
}: GhostNodeProps) {
  const handleClick = () => {
    onClick(); // 觸發跳轉到目標 category 並滾動到 targetLevel
  };

  // 類似 LevelNode 的 className 組合方式
  const nodeClassName = [
    styles.ghostNode,
    styles.reference, // 新增一個特殊標記
  ]
    .filter(Boolean)
    .join(" ");

  // 類似 LevelNode 的 style 設定
  const nodeStyle: React.CSSProperties = {
    left: position.x,
    top: `${position.y}px`,
  };

  return (
    <div
      className={nodeClassName}
      style={nodeStyle}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`參考: ${label}`}
      data-ghost-target={targetLevelId}
    >
      {/* 節點內容（類似 LevelNode 的 nodeContent） */}
      <div className={styles.nodeContent}>
        <Icon name="ghost" className={styles.icon} />
      </div>

      {/* 懸浮標籤（類似 LevelNode 的 levelTooltip） */}
      <div className={styles.ghostTooltip}>
        <span>[{label}]</span>
      </div>
    </div>
  );
}

export default GhostNode;
