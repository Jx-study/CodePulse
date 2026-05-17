import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "@/shared/components/Icon";
import Tooltip from "@/shared/components/Tooltip";
import type { LevelNodeProps } from "@/types";
import styles from "./LevelNode.module.scss";

function LevelNode({
  level,
  status,
  stars,
  position,
  onClick,
  isBossLevel = false,
  pathMetadata,
  categoryColor,
}: LevelNodeProps) {
  const { t } = useTranslation("dashboard");
  const isDeveloped = level.isDeveloped;
  const levelName = t(`levels.${level.id.replace(/-/g, "_")}.name`);
  const unavailableMessage = t("levelUnavailable.undeveloped");
  const ariaLabel = isDeveloped
    ? t("node.ariaLabel", { levelName })
    : `${t("node.ariaLabel", { levelName })}. ${unavailableMessage}`;

  const isCompleted = status === "completed";
  const isInProgress = status === "in-progress";
  const isUnlocked = status === "unlocked";
  const isLockedState = status === "locked";

  const handleClick = () => {
    onClick();
  };

  const renderStatusIcon = () => {
    if (isBossLevel && !isLockedState) {
      return <Icon name="crown" className={styles.bossIcon} />;
    }

    if (isBossLevel && isLockedState) {
      return null;
    }

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

  const renderStars = () => {
    let filledStars = 0;
    if (isCompleted) {
      filledStars = stars;
    }

    const starPositions = [
      { x: -20, y: 2 },
      { x: 0, y: -4 },
      { x: 20, y: 2 },
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

  const nodeElement = (
    <div
      className={nodeClassName}
      style={nodeStyle}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-disabled={!isDeveloped}
      data-level-id={level.id}
    >
      {isBossLevel && status === "locked" && (
        <div className={styles.bossLockOverlay} />
      )}

      {renderStars()}

      <div className={styles.nodeContent}>{renderStatusIcon()}</div>

      {isBossLevel && status === "locked" && (
        <div className={styles.lockOverlay}>
          <Icon name="lock" className={styles.lockIcon} />
        </div>
      )}

      <div className={styles.levelTooltip}>
        <span>{levelName}</span>
      </div>
    </div>
  );

  if (!isDeveloped) {
    return (
      <Tooltip content={unavailableMessage} placement="top">
        {nodeElement}
      </Tooltip>
    );
  }

  return nodeElement;
}

export default LevelNode;
