import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  isPaused = false,
}: TourEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [secondarySpotlightRect, setSecondarySpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [isFinalStep, setIsFinalStep] = useState(false);
  // 記錄已被自動跳過的 interactive steps（以 step.id 為 key），回訪時顯示完成狀態而非再次自動跳過
  const [completedInteractiveSteps, setCompletedInteractiveSteps] = useState<Set<string>>(new Set());
  const currentStep: TourStep | undefined = steps[currentIndex];

  // 後段鎖定：找出第一個「interactive 且 advanceWhen 尚未滿足」的 step。
  // 該 step 之後（index 更大）的 step 在條件滿足前不可跳達；往前不限。
  // 找不到（無未滿足的互動 step）則可達到最後一步。
  const maxReachableIndex = (() => {
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      if (s.interactive && !(s.advanceWhen?.() ?? true)) {
        return i; // 卡在這個互動 step，最遠只能到它本身
      }
    }
    return steps.length - 1;
  })();

  // 讓 rAF loop 永遠讀到最新 step，不需因 step/layout 改變而重啟
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  // 防止 rAF 在 state commit 前重複觸發 handleNext（setCurrentIndex 是異步的）
  const advancingRef = useRef(false);
  // rAF loop 讀最新的 completedInteractiveSteps，不需重建 calculatePositions
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

  // 進入互動 step 時觸發 onEnter（驅動 UI）。
  // 不將 isPaused 列入 deps：paused→resume 不重觸 onEnter，避免對話框關閉後 tab 被切回。
  useEffect(() => {
    if (!isOpen || isFinalStep || isPaused) return;
    currentStep?.onEnter?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isFinalStep, currentIndex]);

  const calculatePositions = useCallback(() => {
    const step = currentStepRef.current;
    if (!step) return;

    // 互動 step：條件成立且尚未記錄完成，才自動前進；已完成者回訪時跳過自動前進
    // 用 step.id（字串）作 key，避免每次 render 重建陣列導致 indexOf 回 -1
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
    // 元素隱藏（如收合面板）時略過
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

    // 第二個 spotlight（選用）
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
  }, [handleNext]); // 讀 currentStepRef.current；handleNext 穩定

  // rAF loop 持續追蹤目標位置（支援面板拖拉、resize、layout 切換、互動前進）
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

  // 鍵盤導航：互動 step 時停用 Next 快捷鍵（避免略過等待）
  useEffect(() => {
    // 暫停時（如外層對話框顯示）完全停用鍵盤：隱藏的 tour 不應被 Esc/方向鍵影響
    if (!isOpen || isPaused) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onSkip(); return; }
      const step = currentStepRef.current;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        // 互動 step 不用方向鍵前進（等 advanceWhen）；
        // 一般 step 僅在未觸及鎖定上限時可前進。
        if (!step?.interactive && currentIndex < maxReachableIndex) handleNext();
      }
      if (e.key === 'ArrowLeft') { handlePrev(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPaused, handleNext, handlePrev, onSkip, currentIndex, maxReachableIndex]);

  // 開啟時重設
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

  // 將所有有效的 spotlight rects 收集起來，供 SVG 遮罩與 border overlay 使用
  const activeRects = [spotlightRect, secondarySpotlightRect].filter(Boolean) as SpotlightRect[];

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={`導覽步驟 ${currentIndex + 1}`}>
      {activeRects.length > 0 ? (
        <>
          {/* SVG 遮罩：單一暗底，每個 spotlight 區域用白色矩形挖洞 */}
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
          {/* spotlight border overlay（不含 box-shadow，只有框線） */}
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
          completedInteractiveSteps.has(currentStep.id) ? (
            // 已完成的互動 step：回訪時顯示完成狀態 + 一般導航
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
              <span className={styles.completedHint}>
                <Icon name="check" size="sm" decorative />
                已完成
              </span>
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
          ) : (
          <div className={styles.waitingHint}>
            {(() => {
              const ws = currentStep.waitingState?.() ?? 'idle';
              // 'idle'：尚未開始操作，顯示靜態提示（不顯示 Codi 避免誤導）
              return ws === 'idle' ? (
                <span><span className={styles.waitingDot} />等待操作…</span>
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
              跳過此步
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
                  disabled={idx > maxReachableIndex}
                  aria-label={`跳至步驟 ${idx + 1}`}
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
              Next
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
