import type { Level, LevelProgress, ScoreLevel } from "@/types";
import { isLevelStarted } from "@/shared/lib/levelProgress";

export type NodePhase = "not-started" | "in-progress" | "completed";

export interface LevelNodeVisualState {
  isUndeveloped: boolean;
  phase: NodePhase;
  teachingDone: boolean;
  practiceDone: boolean;
  practiceLocked: boolean;
  stars: ScoreLevel;
}

/**
 * 由單一關卡的進度推出節點外觀。
 * 外環左半看教學是否完成，右半看練習是否通過或被前置條件鎖住。
 * 練習一旦通過就不再顯示鎖，避免前置條件變動後已通關的節點被鎖起來。
 * 未開發的關卡只顯示沙漏，舊進度不顯示（關卡還沒做，成績不代表現在的內容）。
 */
export function getLevelNodeVisualState(
  level: Level,
  progress: LevelProgress | undefined,
  isPracticeLocked: boolean,
): LevelNodeVisualState {
  if (!level.isDeveloped) {
    return {
      isUndeveloped: true,
      phase: "not-started",
      teachingDone: false,
      practiceDone: false,
      practiceLocked: false,
      stars: 0,
    };
  }

  const teachingDone = progress?.teachingCompleted === true;
  const practiceDone = progress?.status === "completed";

  let phase: NodePhase = "not-started";
  if (practiceDone) {
    phase = "completed";
  } else if (isLevelStarted(progress)) {
    phase = "in-progress";
  }

  return {
    isUndeveloped: false,
    phase,
    teachingDone,
    practiceDone,
    practiceLocked: isPracticeLocked && !practiceDone,
    stars: practiceDone ? (progress?.stars ?? 0) : 0,
  };
}

export type PathStatus = "locked" | "unlocked" | "completed";

/**
 * 連進某關的路徑線狀態，跟著目標節點的練習半環走。
 * 練習通過就維持 completed，前置條件後來變動也不會變回 locked。
 */
export function getPathStatus(state: LevelNodeVisualState): PathStatus {
  if (state.practiceDone) return "completed";
  if (state.isUndeveloped || state.practiceLocked) return "locked";
  return "unlocked";
}
