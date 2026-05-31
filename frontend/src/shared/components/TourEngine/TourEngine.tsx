import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/shared/components/Icon/Icon';
import Button from '@/shared/components/Button/Button';
import type { TourStep, TourEngineProps } from './tourTypes';
import styles from './TourEngine.module.scss';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;

/**
 * 共用導覽引擎：spotlight + tooltip 卡 + rAF 追蹤定位。
 * 支援傳統線性 step 與互動 step（等待外部條件才自動前進）。
 */
export default function TourEngine({
  isOpen,
  steps,
  onComplete,
  onSkip,
  finalPrimaryLabel = '完成',
  finalSecondaryLabel = '關閉',
  finalTitle = '準備好了嗎？',
  finalDescription = '',
  onDontShowAgain,
}: TourEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [isFinalStep, setIsFinalStep] = useState(false);
  const currentStep: TourStep | undefined = steps[currentIndex];

  // 讓 rAF loop 永遠讀到最新 step，不需因 step/layout 改變而重啟
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  const handleNext = useCallback(() => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setIsFinalStep(true);
    }
  }, [currentIndex, steps.length]);

  const handlePrev = useCallback(() => {
    if (isFinalStep) {
      setIsFinalStep(false);
    } else if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  }, [currentIndex, isFinalStep]);

  // 進入互動 step 時觸發 onEnter（驅動 UI）
  useEffect(() => {
    if (!isOpen || isFinalStep) return;
    currentStep?.onEnter?.();
    // 僅在 step 切換時觸發
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isFinalStep, currentIndex]);

  const calculatePositions = useCallback(() => {
    const step = currentStepRef.current;
    if (!step) return;

    // 互動 step：條件成立則自動前進
    if (step.interactive && step.advanceWhen?.()) {
      handleNext();
      return;
    }

    const el = document.querySelector(step.targetSelector);
    if (!el) {
      setSpotlightRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    // 元素隱藏（如收合面板）時略過
    if (rect.width === 0 && rect.height === 0) {
      setSpotlightRect(null);
      return;
    }

    const padded: SpotlightRect = {
      top: rect.top - PADDING,
      left: rect.left - PADDING,
      width: rect.width + PADDING * 2,
      height: rect.height + PADDING * 2,
    };
    setSpotlightRect(padded);

    const TOOLTIP_OFFSET = 16;
    const TOOLTIP_WIDTH = 360;
    const TOOLTIP_HEIGHT = 180;
    const SCREEN_MARGIN = 8;
    const placement = step.placement;

    let top = 0;
    let left = 0;

    if (placement === 'bottom') {
      top = padded.top + padded.height + TOOLTIP_OFFSET;
      left = padded.left + padded.width / 2 - TOOLTIP_WIDTH / 2;
    } else if (placement === 'top') {
      top = padded.top - TOOLTIP_OFFSET - TOOLTIP_HEIGHT;
      left = padded.left + padded.width / 2 - TOOLTIP_WIDTH / 2;
    } else if (placement === 'right') {
      top = padded.top + padded.height / 2 - TOOLTIP_HEIGHT / 2;
      left = padded.left + padded.width + TOOLTIP_OFFSET;
    } else if (placement === 'left') {
      top = padded.top + padded.height / 2 - TOOLTIP_HEIGHT / 2;
      left = padded.left - TOOLTIP_OFFSET - TOOLTIP_WIDTH;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    left = Math.max(SCREEN_MARGIN, Math.min(left, vw - TOOLTIP_WIDTH - SCREEN_MARGIN));
    top = Math.max(SCREEN_MARGIN, Math.min(top, vh - TOOLTIP_HEIGHT - SCREEN_MARGIN));

    setTooltipStyle({ position: 'fixed', top, left });
  }, [handleNext]); // 讀 currentStepRef.current；handleNext 穩定

  // rAF loop 持續追蹤目標位置（支援面板拖拉、resize、layout 切換、互動前進）
  useEffect(() => {
    if (!isOpen || isFinalStep) return;

    let frameId: number;
    const tick = () => {
      calculatePositions();
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isOpen, isFinalStep, calculatePositions]);

  // 鍵盤導航：互動 step 時停用 Next 快捷鍵（避免略過等待）
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onSkip(); return; }
      const step = currentStepRef.current;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (!step?.interactive) handleNext();
      }
      if (e.key === 'ArrowLeft') { handlePrev(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onSkip]);

  // 開啟時重設
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsFinalStep(false);
      setSpotlightRect(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (isFinalStep) {
    return createPortal(
      <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="導覽完成">
        <div className={styles.dimBackground} />
        <div className={styles.card} style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className={styles.cardHeader}>
            <div className={styles.headerMeta}>
              <h3 className={styles.tooltipTitle}>{finalTitle}</h3>
            </div>
            <Button variant="icon" size="sm" iconOnly icon="times" onClick={onSkip} aria-label="關閉導覽" />
          </div>
          {finalDescription && <p className={styles.tooltipDesc}>{finalDescription}</p>}
          <div className={styles.finalActions}>
            <Button variant="primary" size="sm" fullWidth icon="check" onClick={onComplete}>
              {finalPrimaryLabel}
            </Button>
            <Button variant="ghost" size="sm" fullWidth onClick={onSkip}>{finalSecondaryLabel}</Button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  if (!currentStep) return null;

  // 目標未找到時的置中 fallback
  const fallbackTooltipStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={`導覽步驟 ${currentIndex + 1}`}>
      {spotlightRect && (
        <div
          className={styles.spotlight}
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
          }}
        />
      )}
      {!spotlightRect && <div className={styles.dimBackground} />}
      <div className={styles.card} style={spotlightRect ? tooltipStyle : fallbackTooltipStyle}>
        <div className={styles.cardHeader}>
          <div className={styles.headerMeta}>
            <span className={styles.stepBadge}>STEP {currentIndex + 1} OF {steps.length}</span>
            <h3 className={styles.tooltipTitle}>{currentStep.title}</h3>
          </div>
          <div className={styles.headerActions}>
            {onDontShowAgain && (
              <Button
                variant="ghost"
                size="sm"
                className={styles.dontShowAgain}
                onClick={onDontShowAgain}
              >
                不再顯示
              </Button>
            )}
            <Button variant="icon" size="sm" iconOnly icon="times" onClick={onSkip} aria-label="跳過導覽" />
          </div>
        </div>
        <p className={styles.tooltipDesc}>{currentStep.description}</p>

        {currentStep.interactive ? (
          <div className={styles.waitingHint}>
            <span>
              <span className={styles.waitingDot} />
              等待操作…
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={styles.skipStep}
              onClick={() => {
                if (currentStep.onSkipStep) {
                  currentStep.onSkipStep();
                  return;
                }
                handleNext();
              }}
            >
              跳過此步
            </Button>
          </div>
        ) : (
          <div className={styles.tooltipNav}>
            <Button
              variant="ghost"
              size="sm"
              className={styles.btnPrev}
              onClick={handlePrev}
              disabled={currentIndex === 0}
              iconLeft={<Icon name="chevron-left" size="sm" decorative />}
            >
              Previous
            </Button>
            <div className={styles.dots}>
              {steps.map((_, idx) => (
                <Button
                  key={idx}
                  variant="dot"
                  size="sm"
                  className={idx === currentIndex ? styles.dotActive : styles.dotInactive}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`跳至步驟 ${idx + 1}`}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={styles.btnNext}
              onClick={handleNext}
              iconRight={<Icon name="chevron-right" size="sm" decorative />}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
