import type { Level, LevelProgress, ScoreLevel } from "@/types";

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
 */
export function getLevelNodeVisualState(
  level: Level,
  progress: LevelProgress | undefined,
  isPracticeLocked: boolean,
): LevelNodeVisualState {
  const teachingDone = progress?.teachingCompleted === true;
  const practiceDone = progress?.status === "completed";
  const practiceStarted =
    (progress?.attempts ?? 0) > 0 || progress?.status === "in-progress";

  let phase: NodePhase = "not-started";
  if (practiceDone) {
    phase = "completed";
  } else if (teachingDone || practiceStarted) {
    phase = "in-progress";
  }

  return {
    isUndeveloped: !level.isDeveloped,
    phase,
    teachingDone,
    practiceDone,
    practiceLocked: isPracticeLocked && !practiceDone,
    stars: practiceDone ? (progress?.stars ?? 0) : 0,
  };
}
