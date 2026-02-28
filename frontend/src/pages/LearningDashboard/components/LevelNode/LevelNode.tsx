import React from "react";
import styles from "./LevelNode.module.scss";
import Icon from "@/shared/components/Icon";
import type { LevelNodeProps } from "@/types";

function LevelNode({
  level,
  status,
  stars,
  isLocked,
  position,
  onClick,
  isBossLevel = false,
  pathMetadata,
  categoryColor,
}: LevelNodeProps) {
  const isDeveloped = level.isDeveloped;

  // 統一狀態判斷：與 LevelDialog 一致
  const isCompleted = status === "completed";
  const isInProgress = status === "in-progress";
  const isUnlocked = status === "unlocked";
  const isLockedState = status === "locked";

  const handleClick = () => {
    // 只有已開發的功能才能點擊
    if (isDeveloped) {
      onClick();
    }
  };

  // 根據 status 顯示不同圖標
  const renderStatusIcon = () => {
    // Boss Level 且鎖定時不顯示皇冠，顯示鎖頭 overlay
    if (isBossLevel && !isLockedState) {
      return <Icon name="crown" className={styles.bossIcon} />;
    }

    if (isBossLevel && isLockedState) {
      // 鎖定的 Boss Level 不在這裡顯示圖標，由 lockOverlay 顯示
      return null;
    }

    // 普通關卡根據狀態顯示圖標
    if (isLockedState) {
      return <Icon name="lock" className={styles.icon} />;
    }
    if (isCompleted) {
      return <Icon name="check" className={styles.icon} />;
    }
    if (isInProgress) {
      return <Icon name="play" className={styles.icon} />;
    }
    if (isUnlocked) {
      return <Icon name="location-crosshairs" className={styles.icon} />;
    }
    return null;
  };

  // 渲染星星（固定3顆，完成度映射顏色）
  const renderStars = () => {
    // stars 範圍: 1-5 (DifficultyLevel)
    // 映射到 3 顆星: 1-2 stars = 1顆黃 | 3 stars = 2顆黃 | 4-5 stars = 3顆黃
    let filledStars = 0;
    if (isCompleted) {
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
      { x: -20, y: 2 }, // 左星星：左移20px，下移2px
      { x: 0, y: -4 }, // 中間星星：中心位置，上移4px
      { x: 20, y: 2 }, // 右星星：右移20px，下移2px
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
                left: "50%",
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
    ...(isBossLevel && categoryColor
      ? ({ "--category-color": categoryColor } as React.CSSProperties)
      : {}),
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
      {/* Boss Level 鎖定時顯示黑色半透明遮罩 */}
      {isBossLevel && status === "locked" && (
        <div className={styles.bossLockOverlay} />
      )}

      {/* 星星顯示在節點外部上方 */}
      {renderStars()}

      {/* 節點內容（顯示狀態圖標） */}
      <div className={styles.nodeContent}>{renderStatusIcon()}</div>

      {/* Boss Level 鎖定時顯示鎖頭 icon */}
      {isBossLevel && status === "locked" && (
        <div className={styles.lockOverlay}>
          <Icon name="lock" className={styles.lockIcon} />
        </div>
      )}

      {/* 關卡名稱標籤 */}
      <div className={styles.levelTooltip}>
        <span>{level.name}</span>
      </div>
    </div>
  );
}

export default LevelNode;
