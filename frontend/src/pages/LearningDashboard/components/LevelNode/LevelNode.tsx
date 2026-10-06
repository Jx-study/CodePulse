import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "@/shared/components/Icon";
import Tooltip from "@/shared/components/Tooltip";
import type { LevelNodeProps } from "@/types";
import { getLevelNodeVisualState, type NodePhase } from "./levelNodeState";
import styles from "./LevelNode.module.scss";

// 外環左右兩半，上下各留 6° 缺口；viewBox 0 0 100 100、半徑 44
const TEACH_ARC = "M45.4 6.24 A44 44 0 0 0 45.4 93.76";
const PRACTICE_ARC = "M54.6 6.24 A44 44 0 0 1 54.6 93.76";

const PHASE_ICON = {
  "not-started": "circle",
  "in-progress": "circle-half-stroke",
  completed: "check",
} as const satisfies Record<NodePhase, string>;

const STAR_POSITIONS = [
  { x: -20, y: 2 },
  { x: 0, y: -4 },
  { x: 20, y: 2 },
];

function LevelNode({
  level,
  progress,
  isPracticeLocked,
  isRecommended = false,
  position,
  onClick,
  isBossLevel = false,
  pathMetadata,
  categoryColor,
}: LevelNodeProps) {
  const { t } = useTranslation("dashboard");
  const state = getLevelNodeVisualState(level, progress, isPracticeLocked);
  const levelName = t(`levels.${level.id.replace(/-/g, "_")}.name`);
  const unavailableMessage = t("levelUnavailable.undeveloped");
  // 教學一律開放，鎖定只影響練習，提示文字要說清楚差異
  const practiceLockedMessage = t("levelUnavailable.locked");
  const showRecommended = isRecommended && !state.isUndeveloped;
  const showBossDecor = isBossLevel && !state.isUndeveloped;

  const ariaLabel = [
    t("node.ariaLabel", { levelName }),
    state.isUndeveloped && unavailableMessage,
    !state.isUndeveloped && state.practiceLocked && practiceLockedMessage,
    showRecommended && t("node.recommended"),
  ]
    .filter(Boolean)
    .join(". ");

  const practiceArcState = state.practiceDone
    ? "done"
    : state.practiceLocked
      ? "locked"
      : "open";

  const nodeClassName = [
    styles.levelNode,
    styles[position.alignment],
    state.isUndeveloped && styles.undeveloped,
    state.phase === "completed" && styles.completed,
    state.practiceLocked && styles.practiceLocked,
    showRecommended && styles.recommended,
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
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-disabled={state.isUndeveloped}
      data-level-id={level.id}
      data-phase={state.phase}
      data-recommended={String(showRecommended)}
    >
      {showBossDecor && (
        <>
          <span className={styles.bossAura} aria-hidden="true" />
          <span className={styles.bossPlate} aria-hidden="true" data-boss-plate />
        </>
      )}

      <div className={styles.core} />

      {!state.isUndeveloped && (
        <svg className={styles.ring} viewBox="0 0 100 100" aria-hidden="true">
          <path
            d={TEACH_ARC}
            className={state.teachingDone ? styles.arcTeachDone : styles.arcTeachOpen}
            data-arc="teach"
            data-arc-state={state.teachingDone ? "done" : "open"}
          />
          <path
            d={PRACTICE_ARC}
            className={
              practiceArcState === "done"
                ? styles.arcPracticeDone
                : practiceArcState === "locked"
                  ? styles.arcPracticeLocked
                  : styles.arcPracticeOpen
            }
            data-arc="practice"
            data-arc-state={practiceArcState}
          />
        </svg>
      )}

      <div className={styles.nodeContent}>
        <Icon
          name={state.isUndeveloped ? "hourglass-half" : PHASE_ICON[state.phase]}
          className={styles.icon}
        />
      </div>

      {!state.isUndeveloped && state.practiceLocked && (
        <div className={styles.ringLock}>
          <Icon name="lock" className={styles.ringLockIcon} />
        </div>
      )}

      {showBossDecor && <Icon name="crown" className={styles.bossCrown} />}

      {state.practiceDone && (
        <div className={styles.starsContainer}>
          {STAR_POSITIONS.map((pos, index) => {
            const isFilled = index < state.stars;
            return (
              <span
                key={index}
                className={`${styles.star} ${isFilled ? styles.filled : styles.empty}`}
                data-filled={String(isFilled)}
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
      )}

      <div className={styles.levelTooltip}>
        {isBossLevel && <span className={styles.bossChip}>BOSS</span>}
        <span>{levelName}</span>
      </div>
    </div>
  );

  if (state.isUndeveloped) {
    return (
      <Tooltip content={unavailableMessage} placement="top">
        {nodeElement}
      </Tooltip>
    );
  }

  if (state.practiceLocked) {
    return (
      <Tooltip content={practiceLockedMessage} placement="top">
        {nodeElement}
      </Tooltip>
    );
  }

  return nodeElement;
}

export default LevelNode;
