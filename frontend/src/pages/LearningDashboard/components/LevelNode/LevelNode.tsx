import React from "react";
import styles from "./LevelNode.module.scss";
import StarRating from "@/shared/components/StarRating";
import type { Level } from "@/types";

interface LevelNodeProps {
  level: Level;
  status: "locked" | "unlocked" | "in-progress" | "completed";
  stars: number;
  isLocked: boolean; // 用戶是否解鎖（控制 Practice 按鈕）
  isDeveloped: boolean; // 功能是否開發（控制節點能否點擊）
  alignment: "left" | "right" | "center"; 
  style?: React.CSSProperties;
  onClick: () => void;
}

function LevelNode({
  level,
  status,
  stars,
  isLocked,
  isDeveloped,
  alignment,
  style,
  onClick,
}: LevelNodeProps) {
  const handleClick = () => {
    // 只有已開發的功能才能點擊
    if (isDeveloped) {
      onClick();
    }
  };

  const renderStars = () => {
    if (status !== "completed" || stars === 0) return null;

    return (
      <StarRating
        value={stars}
        max={3}
        size="xs"
        readonly
        className={styles.stars}
      />
    );
  };

  // TODO: 根據 status 顯示不同圖標
  const renderStatusIcon = () => {
    switch (status) {
      case "locked":
        return <span className={styles.icon}>●</span>;
      case "completed":
        return <span className={styles.icon}>✓</span>;
      case "in-progress":
        return <span className={styles.icon}>▶</span>;
      default:
        return null;
    }
  };

  const nodeClassName = [
    styles.levelNode,
    styles[status],
    styles[alignment],
    !isDeveloped && styles.undeveloped,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={nodeClassName}
      style={style}
      onClick={handleClick}
      role="button"
      tabIndex={isDeveloped ? 0 : -1}
      aria-label={`關卡: ${level.name}`}
      aria-disabled={!isDeveloped}
      data-level-id={level.id}
    >
      <div className={styles.nodeContent}>
        {renderStatusIcon()}
        <span className={styles.levelName}>{level.name}</span>
        {renderStars()}
      </div>

      {/* 關卡名稱標籤（懸浮顯示） */}
      <div className={styles.levelTooltip}>
        <span>{level.name}</span>
      </div>
    </div>
  );
}

export default LevelNode;
