import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import Icon from '@/shared/components/Icon/Icon';
import Button from '@/shared/components/Button/Button';
import type { TourStep, TourEngineProps } from './tourTypes';
import styles from './TourEngine.module.scss';
import MascotWaiting from './MascotWaiting';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;

/**
 * Shared tour engine: spotlight + tooltip card + rAF position tracking.
 * Supports traditional linear steps and interactive steps (auto-advances when an external condition is met).
 */
export default function TourEngine({
  isOpen,
  steps,
  onComplete,
  onSkip,
  finalPrimaryLabel = 'Done',
  finalSecondaryLabel = 'Close',
  finalTitle = 'Ready?',
  finalDescription = '',
  onDontShowAgain,
  isPaused = false,
}: TourEngineProps) {
  const { t } = useTranslation('common');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [secondarySpotlightRect, setSecondarySpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [isFinalStep, setIsFinalStep] = useState(false);
  // Tracks auto-completed interactive steps (keyed by step.id); on revisit shows completed state instead of auto-advancing again
  const [completedInteractiveSteps, setCompletedInteractiveSteps] = useState<Set<string>>(new Set());
  const currentStep: TourStep | undefined = steps[currentIndex];

  // Back-lock: find the first interactive step whose advanceWhen is not yet satisfied.
  // Steps after it (higher index) are unreachable until the condition is met; going back is always allowed.
  // If none found (no unsatisfied interactive step), the last step is reachable.
  const maxReachableIndex = (() => {
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      if (s.interactive && !(s.advanceWhen?.() ?? true)) {
        return i; // blocked at this interactive step — can go no further
      }
    }
    return steps.length - 1;
  })();

  // Gives the rAF loop always-fresh step access without restarting on step/layout changes
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  // Prevents the rAF from firing handleNext multiple times before state commits (setCurrentIndex is async)
  const advancingRef = useRef(false);
  // Gives calculatePositions always-fresh completedInteractiveSteps without needing to rebuild on changes
  const completedInteractiveStepsRef = useRef(completedInteractiveSteps);
  completedInteractiveStepsRef.current = completedInteractiveSteps;

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

  // Fire onEnter when entering an interactive step (drives UI).
  // isPaused intentionally excluded from deps: paused→resume must not re-fire onEnter (avoids switching tabs back after dialog closes).
  useEffect(() => {
    if (!isOpen || isFinalStep || isPaused) return;
    currentStep?.onEnter?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isFinalStep, currentIndex]);

  const calculatePositions = useCallback(() => {
    const step = currentStepRef.current;
    if (!step) return;

    // Interactive step: auto-advance only if condition is met and not yet recorded as completed; skip auto-advance on revisit
    // Use step.id (string) as key to avoid indexOf returning -1 when the array is rebuilt on every render
    if (step.interactive && step.advanceWhen?.()) {
      if (!completedInteractiveStepsRef.current.has(step.id) && !advancingRef.current) {
        advancingRef.current = true;
        setCompletedInteractiveSteps(prev => new Set(prev).add(step.id));
        handleNext();
      }
      return;
    }
    advancingRef.current = false;

    const el = document.querySelector(step.targetSelector);
    if (!el) {
      setSpotlightRect(null);
      setSecondarySpotlightRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    // Skip elements that are hidden (e.g. collapsed panels)
    if (rect.width === 0 && rect.height === 0) {
      setSpotlightRect(null);
      setSecondarySpotlightRect(null);
      return;
    }

    const padded: SpotlightRect = {
      top: rect.top - PADDING,
      left: rect.left - PADDING,
      width: rect.width + PADDING * 2,
      height: rect.height + PADDING * 2,
    };
    setSpotlightRect(padded);

    // Second spotlight (optional)
    if (step.secondaryTargetSelector) {
      const el2 = document.querySelector(step.secondaryTargetSelector);
      if (el2) {
        const r2 = el2.getBoundingClientRect();
        if (r2.width > 0 || r2.height > 0) {
          setSecondarySpotlightRect({
            top: r2.top - PADDING,
            left: r2.left - PADDING,
            width: r2.width + PADDING * 2,
            height: r2.height + PADDING * 2,
          });
        } else {
          setSecondarySpotlightRect(null);
        }
      } else {
        setSecondarySpotlightRect(null);
      }
    } else {
      setSecondarySpotlightRect(null);
    }

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
  }, [handleNext]); // reads currentStepRef.current; handleNext is stable

  // rAF loop continuously tracks target position (supports panel drag, resize, layout switch, and interactive advance)
  useEffect(() => {
    if (!isOpen || isFinalStep || isPaused) return;

    let frameId: number;
    const tick = () => {
      calculatePositions();
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isOpen, isFinalStep, isPaused, calculatePositions]);

  // Keyboard navigation: disable Next shortcut on interactive steps (to avoid skipping the wait)
  useEffect(() => {
    // When paused (e.g. an overlaying dialog is shown), disable keyboard entirely — a hidden tour should not respond to Esc/arrow keys
    if (!isOpen || isPaused) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onSkip(); return; }
      const step = currentStepRef.current;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        // Interactive steps cannot advance with arrow keys (wait for advanceWhen);
        // regular steps can only advance if the back-lock ceiling has not been reached.
        if (!step?.interactive && currentIndex < maxReachableIndex) handleNext();
      }
      if (e.key === 'ArrowLeft') { handlePrev(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPaused, handleNext, handlePrev, onSkip, currentIndex, maxReachableIndex]);

  // Reset when the tour opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsFinalStep(false);
      setSpotlightRect(null);
      setCompletedInteractiveSteps(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;
  if (isPaused) return null;

  if (isFinalStep) {
    return createPortal(
      <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={t('tour.ariaComplete')}>
        <div className={styles.dimBackground} />
        <div className={styles.card} style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className={styles.cardHeader}>
            <div className={styles.headerMeta}>
              <h3 className={styles.tooltipTitle}>{finalTitle}</h3>
            </div>
            <Button variant="icon" size="sm" iconOnly icon="times" onClick={onSkip} aria-label={t('tour.ariaCloseTour')} />
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

  // Centered fallback when the target element is not found
  const fallbackTooltipStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  // Collect all valid spotlight rects for use by the SVG mask and border overlay
  const activeRects = [spotlightRect, secondarySpotlightRect].filter(Boolean) as SpotlightRect[];

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={t('tour.ariaStep', { current: currentIndex + 1 })}>
      {activeRects.length > 0 ? (
        <>
          {/* SVG mask: single dark overlay, each spotlight region punched out with a white rectangle */}
          <svg className={styles.svgMask} aria-hidden="true">
            <defs>
              <mask id="tour-spotlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {activeRects.map((r, i) => (
                  <rect
                    key={i}
                    x={r.left}
                    y={r.top}
                    width={r.width}
                    height={r.height}
                    rx="6"
                    fill="black"
                  />
                ))}
              </mask>
            </defs>
            <rect
              x="0" y="0" width="100%" height="100%"
              fill="rgba(17,24,39,0.6)"
              mask="url(#tour-spotlight-mask)"
            />
          </svg>
          {/* spotlight border overlay (border only, no box-shadow) */}
          {activeRects.map((r, i) => (
            <div
              key={i}
              className={styles.spotlightBorder}
              style={{ top: r.top, left: r.left, width: r.width, height: r.height }}
            />
          ))}
        </>
      ) : (
        <div className={styles.dimBackground} />
      )}
      <div className={styles.card} style={spotlightRect ? tooltipStyle : fallbackTooltipStyle}>
        <div className={styles.cardHeader}>
          <div className={styles.headerMeta}>
            <span className={styles.stepBadge}>{t('tour.stepOf', { current: currentIndex + 1, total: steps.length })}</span>
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
                {t('tour.dontShowAgain')}
              </Button>
            )}
            <Button variant="icon" size="sm" iconOnly icon="times" onClick={onSkip} aria-label={t('tour.ariaSkipTour')} />
          </div>
        </div>
        <p className={styles.tooltipDesc}>{currentStep.description}</p>

        {currentStep.interactive ? (
          completedInteractiveSteps.has(currentStep.id) ? (
            // Completed interactive step: show completed state on revisit + regular navigation
            <div className={styles.tooltipNav}>
              <Button
                variant="ghost"
                size="sm"
                className={styles.btnPrev}
                onClick={handlePrev}
                disabled={currentIndex === 0}
                iconLeft={<Icon name="chevron-left" size="sm" decorative />}
              >
                {t('tour.previous')}
              </Button>
              <span className={styles.completedHint}>
                <Icon name="check" size="sm" decorative />
                {t('tour.completed')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className={styles.btnNext}
                onClick={handleNext}
                iconRight={<Icon name="chevron-right" size="sm" decorative />}
              >
                {t('tour.next')}
              </Button>
            </div>
          ) : (
          <div className={styles.waitingHint}>
            {(() => {
              const ws = currentStep.waitingState?.() ?? 'idle';
              // 'idle': action not yet started — show static hint (no Codi to avoid misleading the user)
              return ws === 'idle' ? (
                <span><span className={styles.waitingDot} />{t('tour.waitingForAction')}</span>
              ) : (
                <MascotWaiting state={ws === 'error' ? 'error' : 'running'} />
              );
            })()}
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
              {t('tour.skipThisStep')}
            </Button>
          </div>
          )
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
              {t('tour.previous')}
            </Button>
            <div className={styles.dots}>
              {steps.map((_, idx) => (
                <Button
                  key={idx}
                  variant="dot"
                  size="sm"
                  className={idx === currentIndex ? styles.dotActive : styles.dotInactive}
                  onClick={() => setCurrentIndex(idx)}
                  disabled={idx > maxReachableIndex}
                  aria-label={t('tour.ariaGoToStep', { step: idx + 1 })}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={styles.btnNext}
              onClick={handleNext}
              disabled={currentIndex >= maxReachableIndex && maxReachableIndex < steps.length - 1}
              iconRight={<Icon name="chevron-right" size="sm" decorative />}
            >
              {t('tour.next')}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
