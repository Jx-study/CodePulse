import Button from '@/shared/components/Button';
import Icon from '@/shared/components/Icon';
import Slider from '@/shared/components/Slider';
import styles from './ControlBar.module.scss';
import { useTranslation } from 'react-i18next';
import { useCallback, useRef, useState } from 'react';
import { D3CanvasRef } from '../../Render/D3Canvas';
import { LinkManager } from '../../DataLogic/LinkManager';
import { BaseElement } from '../../DataLogic/BaseElement';
import { animateConnect } from '../../Render/D3Renderer';

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
  showSpeedSlider?: boolean;
}

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
  showSpeedSlider = true,
}: ControlBarProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<D3CanvasRef>(null);
  const speeds = [0.5, 1, 1.5, 2];
  // const triggerLink = useCallback(async () => {
  //   const svgEl = canvasRef.current?.getSVGElement();
  //   if (!svgEl) return;
    
  //   await animateConnect(svgEl, elements, manager, "n1", "n2", 800);
  //   setLinks(manager.links);
  // }, [elements, manager]);

  const clearLink = useCallback(() => {
    // setLinks([]);
  }, []);

  return (
    <div className={styles.controlBar}>
      {/* Control Buttons */}
      <div className={styles.controls}>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
          {/* <button onClick={triggerLink}>{t('connect') || 'Connect n1->n2'}</button> */}
          <button onClick={clearLink}>{t('clear') || 'Clear'}</button>
        </div>
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
      <div className={styles.stepIndicator}>
        <span className={styles.stepText}>
          Step {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* Speed Selector */}
      <div className={styles.speedSelector}>
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
        {showSpeedSlider && (
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
        )}
      </div>
    </div>
  );
}

export default ControlBar;