import { useEffect, useRef, type Dispatch } from "react";
import type { LabAction } from "../context/LabContext";

const BASE_INTERVAL_MS = 100;
const TARGET_FRAMES = 300;

/**
 * 共享時鐘：playing 時依 speed 以 setInterval 推進 TICK。
 * 當 maxSteps 超過 TARGET_FRAMES 時自動批次推進，保持動畫在合理時長內完成。
 */
export function useLabAnimation(
  playState: "idle" | "playing" | "paused" | "done",
  speed: number,
  maxSteps: number,
  dispatch: Dispatch<LabAction>,
) {
  const maxStepsRef = useRef(maxSteps);
  maxStepsRef.current = maxSteps;

  useEffect(() => {
    if (playState !== "playing") return;
    if (maxStepsRef.current === 0) return;

    const ms = BASE_INTERVAL_MS / speed;
    const id = window.setInterval(() => {
      const cap = maxStepsRef.current;
      const stepsToAdvance = Math.max(1, Math.ceil(cap / TARGET_FRAMES));
      dispatch({ type: "TICK", maxSteps: cap, stepsToAdvance });
    }, ms);

    return () => window.clearInterval(id);
  }, [playState, speed, dispatch]);
}
