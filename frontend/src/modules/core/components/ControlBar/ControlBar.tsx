import { useEffect, useRef, useState } from 'react';
import Button from '@/shared/components/Button';
import Icon from '@/shared/components/Icon';
import Slider from '@/shared/components/Slider';
import styles from './ControlBar.module.scss';

export interface ControlBarProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  playbackSpeed: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onStepChange: (step: number) => void;
}

const HIDE_SPEED_BUTTONS_THRESHOLD = 740;  // px — 隱藏 speedButtons 快捷按鈕
const HIDE_SPEED_SELECTOR_THRESHOLD = 620; // px — 隱藏整個 speedSelector
const HIDE_STEP_INDICATOR_THRESHOLD = 440; // px — 隱藏 stepIndicator

function ControlBar({
  isPlaying,
  currentStep,
  totalSteps,
  playbackSpeed,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReset,
  onSpeedChange,
  onStepChange,
}: ControlBarProps) {
  const speeds = [0.5, 1, 1.5, 2, 3];
  const barRef = useRef<HTMLDivElement>(null);
  const [barWidth, setBarWidth] = useState(Infinity);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setBarWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hideSpeedButtons  = barWidth < HIDE_SPEED_BUTTONS_THRESHOLD;
  const hideSpeedSelector = barWidth < HIDE_SPEED_SELECTOR_THRESHOLD;
  const hideStepIndicator = barWidth < HIDE_STEP_INDICATOR_THRESHOLD;

  return (
    <div
      ref={barRef}
      className={styles.controlBar}
      style={{ justifyContent: (hideStepIndicator || hideSpeedSelector) ? 'center' : 'space-between' }}
      data-tour="control-bar"
    >
      {/* Control Buttons */}
      <div className={styles.controls}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={currentStep === 0}
          aria-label="Previous step"
          iconLeft={<Icon name="step-backward" size="sm" />}
        />

        {isPlaying ? (
          <Button
            variant="primary"
            size="sm"
            onClick={onPause}
            aria-label="Pause"
            iconLeft={<Icon name="pause" size="sm" />}
          />
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={onPlay}
            disabled={currentStep >= totalSteps - 1}
            aria-label="Play"
            iconLeft={<Icon name="play" size="sm" />}
          />
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={currentStep >= totalSteps - 1}
          aria-label="Next step"
          iconLeft={<Icon name="step-forward" size="sm" />}
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          aria-label="Reset"
          iconLeft={<Icon name="sync" size="sm" />}
        />
      </div>

      {/* Step Indicator */}
      {!hideStepIndicator && (
        <div className={styles.stepIndicator}>
          <span className={styles.stepText}>
            Step {currentStep + 1} / {totalSteps}
          </span>
          <div className={styles.stepSlider}>
            <Slider
              min={0}
              max={totalSteps - 1}
              step={1}
              value={currentStep}
              onChange={onStepChange}
              showValue={false}
              ariaLabel="Step progress"
            />
          </div>
        </div>
      )}

      {/* Speed Selector */}
      {!hideSpeedSelector && (
        <div className={styles.speedSelector}>
          {!hideSpeedButtons && (
            <div className={styles.speedRow}>
              <span className={styles.speedLabel}>Speed:</span>
              <div className={styles.speedButtons}>
                {speeds.map((speed) => (
                  <Button
                    key={speed}
                    variant="ghost"
                    size="sm"
                    className={`${styles.speedButton} ${
                      Math.abs(playbackSpeed - speed) < 0.05 ? styles.active : ''
                    }`}
                    onClick={() => onSpeedChange(speed)}
                    aria-label={`Set speed to ${speed}x`}
                  >
                    {speed}x
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className={styles.sliderRow}>
            <Slider
              min={0.1}
              max={3.0}
              step={0.1}
              value={playbackSpeed}
              onChange={onSpeedChange}
              showValue={true}
              formatValue={(v) => `${v.toFixed(1)}x`}
              ariaLabel="Playback speed"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ControlBar;