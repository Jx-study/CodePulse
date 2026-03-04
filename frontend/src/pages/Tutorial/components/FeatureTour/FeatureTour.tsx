import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DESKTOP_STEPS, MOBILE_STEPS, type TourStep } from './featureTourSteps';
import Icon from '@/shared/components/Icon/Icon';
import Button from '@/shared/components/Button/Button';
import styles from './FeatureTour.module.scss';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface FeatureTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  isMobile: boolean;
}

const PADDING = 8;

export default function FeatureTour({ isOpen, onComplete, onSkip, isMobile }: FeatureTourProps) {
  const steps = isMobile ? MOBILE_STEPS : DESKTOP_STEPS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [isFinalStep, setIsFinalStep] = useState(false);
  const currentStep: TourStep | undefined = steps[currentIndex];

  // Keep a ref to the latest step so the rAF loop always reads fresh data
  // without needing to restart when the step or layout changes
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  const calculatePositions = useCallback(() => {
    const step = currentStepRef.current;
    if (!step) return;
    const el = document.querySelector(step.targetSelector);
    if (!el) {
      setSpotlightRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    // Skip if element is hidden (e.g. collapsed panel)
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
  }, []); // stable — reads currentStepRef.current at call time

  // Continuously track target element position via rAF loop
  // Handles: layout swap (DOM remount), panel drag-resize, window resize
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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onSkip(); return; }
      if (e.key === 'ArrowRight' || e.key === 'Enter') { handleNext(); }
      if (e.key === 'ArrowLeft') { handlePrev(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onSkip]);

  // Reset on open
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
      <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="功能導覽完成">
        <div className={styles.dimBackground} />
        <div className={styles.card} style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className={styles.cardHeader}>
            <div className={styles.headerMeta}>
              <h3 className={styles.tooltipTitle}>準備好了嗎？</h3>
            </div>
            <Button variant="icon" size="sm" iconOnly icon="times" onClick={onSkip} aria-label="關閉導覽" />
          </div>
          <p className={styles.tooltipDesc}>
            在開始練習前，先到知識補充站了解這個演算法的理論基礎吧！
          </p>
          <div className={styles.finalActions}>
            <Button variant="primary" size="sm" fullWidth icon="check" onClick={onComplete}>
              進入知識補充站
            </Button>
            <Button variant="ghost" size="sm" fullWidth onClick={onSkip}>暫時不需要，直接開始</Button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  if (!currentStep) return null;

  // Centered fallback tooltip style when element not found yet
  const fallbackTooltipStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={`功能導覽步驟 ${currentIndex + 1}`}>
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
          <Button variant="icon" size="sm" iconOnly icon="times" onClick={onSkip} aria-label="跳過導覽" />
        </div>
        <p className={styles.tooltipDesc}>{currentStep.description}</p>
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
      </div>
    </div>,
    document.body
  );
}
