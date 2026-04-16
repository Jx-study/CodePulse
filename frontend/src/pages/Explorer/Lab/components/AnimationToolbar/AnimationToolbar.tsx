import Button from "@/shared/components/Button";
import Icon from "@/shared/components/Icon";
import Select from "@/shared/components/Select/Select";
import { useLabContext } from "../../context/LabContext";
import styles from "./AnimationToolbar.module.scss";

const SPEED_OPTIONS = [
  { value: "0.25", label: "0.25×" },
  { value: "0.5", label: "0.5×" },
  { value: "1", label: "1×" },
  { value: "2", label: "2×" },
  { value: "4", label: "4×" },
];

export function AnimationToolbar() {
  const {
    playState,
    speed,
    selectedIds,
    maxSteps,
    dispatch,
    layoutFlipped,
  } = useLabContext();

  const disabled = selectedIds.length === 0 || maxSteps === 0;

  const onPlay = () => dispatch({ type: "PLAY" });
  const onPause = () => dispatch({ type: "PAUSE" });
  const onReset = () => dispatch({ type: "RESET" });

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <Button
          size="sm"
          variant="primary"
          disabled={disabled || playState === "playing"}
          onClick={onPlay}
          aria-label="播放"
        >
          <Icon name="play" decorative />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={disabled || playState !== "playing"}
          onClick={onPause}
          aria-label="暫停"
        >
          <Icon name="pause" decorative />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={onReset}
          aria-label="重置"
        >
          <Icon name="rotate" decorative />
        </Button>
      </div>

      <label className={styles.speed}>
        <span className={styles.speedLabel}>速度</span>
        <Select
          size="sm"
          value={String(speed)}
          options={SPEED_OPTIONS}
          onChange={(e) =>
            dispatch({ type: "SET_SPEED", speed: parseFloat(e.target.value) })
          }
          aria-label="播放速度"
        />
      </label>

      <Button
        size="sm"
        variant="secondary"
        className={styles.flipBtn}
        onClick={() => dispatch({ type: "TOGGLE_LAYOUT_FLIP" })}
        aria-pressed={layoutFlipped}
      >
        {layoutFlipped ? "佈局：右欄" : "佈局：左欄"}
      </Button>
    </div>
  );
}
