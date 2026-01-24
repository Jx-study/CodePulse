import React from "react";
import styles from "./LevelNode.module.scss";
import Icon from "@/shared/components/Icon";
import type { LevelNodeProps } from "@/types/pages/dashboard";

function LevelNode({
  level,
  status,
  stars,
  isLocked,
  position,
  onClick,
  isBossLevel = false,
  pathMetadata,
}: LevelNodeProps) {
  const isDeveloped = level.isDeveloped;

  const handleClick = () => {
    // 只有已開發的功能才能點擊
    if (isDeveloped) {
      onClick();
    }
  };

  // 根據 status 顯示不同圖標
  const renderStatusIcon = () => {
    // Boss Level 顯示皇冠圖示
    if (isBossLevel) {
      return <span className={styles.bossIcon}>👑</span>;
    }

    switch (status) {
      case "locked":
        return <Icon name="lock" className={styles.icon} />;
      case "completed":
        return <Icon name="check" className={styles.icon} />;
      case "in-progress":
      case "unlocked":
        return <Icon name="screwdriver-wrench" className={styles.icon} />;
      default:
        return null;
    }
  };

  // 渲染星星（固定3顆，完成度映射顏色）
  const renderStars = () => {
    // stars 範圍: 1-5 (DifficultyLevel)
    // 映射到 3 顆星: 1-2 stars = 1顆黃 | 3 stars = 2顆黃 | 4-5 stars = 3顆黃
    let filledStars = 0;
    if (status === "completed") {
      if (stars >= 4) {
        filledStars = 3; // 100%
      } else if (stars === 3) {
        filledStars = 2; // 66%
      } else {
        filledStars = 1; // 33%
      }
    }

    // 弧形定位計算：左星星、中間星星、右星星
    const starPositions = [
      { x: -20, y: 2 },  // 左星星：左移20px，下移2px
      { x: 0, y: -4 },    // 中間星星：中心位置，上移4px
      { x: 20, y: 2 },   // 右星星：右移20px，下移2px
    ];

    return (
      <div className={styles.starsContainer}>
        {[0, 1, 2].map((index) => {
          const isFilled = index < filledStars;
          const pos = starPositions[index];
          return (
            <span
              key={index}
              className={`${styles.star} ${isFilled ? styles.filled : styles.empty}`}
              style={{
                left: '50%',
                transform: `translateX(calc(-50% + ${pos.x}px)) translateY(${pos.y}px)`,
              }}
            >
              <Icon name="star" />
            </span>
          );
        })}
      </div>
    );
  };

  const nodeClassName = [
    styles.levelNode,
    styles[status],
    styles[position.alignment],
    !isDeveloped && styles.undeveloped,
    isBossLevel && styles.boss,
    pathMetadata?.pathType && styles[pathMetadata.pathType],
  ]
    .filter(Boolean)
    .join(" ");

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
      tabIndex={isDeveloped ? 0 : -1}
      aria-label={`關卡: ${level.name}`}
      aria-disabled={!isDeveloped}
      data-level-id={level.id}
    >
      {/* 星星顯示在節點外部上方 */}
      {renderStars()}

      {/* 節點內容（顯示狀態圖標） */}
      <div className={styles.nodeContent}>
        {renderStatusIcon()}
      </div>

      {/* 關卡名稱標籤 */}
      <div className={styles.levelTooltip}>
        <span>{level.name}</span>
      </div>
    </div>
  );
}

export default LevelNode;
