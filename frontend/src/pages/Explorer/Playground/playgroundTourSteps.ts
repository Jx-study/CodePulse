import type { TFunction } from 'i18next';
import type { TourStep } from '@/shared/components/TourEngine';
import type { RunStage } from '@/types/runStage';
import { ALGORITHM_TO_CONVERTER_KEY } from '@/data/implementations/traceConverters';

/** Last run outcome (from usePlaygroundRun, explicit semantics) */
type RunOutcome = 'none' | 'running' | 'success' | 'error';

interface BuildPlaygroundTourArgs {
  /** Current runStage; the interactive Run step uses this to detect whether execution has completed (done) */
  runStage: RunStage;
  /** Last run outcome; the interactive Run step uses this to decide which mascot to show (running / error) */
  lastRunOutcome: RunOutcome;
  /** Switch to the animation tab (used by onEnter) */
  goAnimationTab: () => void;
  /** Currently docked panel id; the interactive drag-dock step uses this to detect whether the drag is complete */
  leftDockedId: string | null;
  /** Whether AlgoDetectionDialog is currently open; algo-detection step advances once it closes */
  isAlgoDialogOpen: boolean;
  /** i18n translation function (playground namespace) */
  t: TFunction;
}

// Backend detected_algorithm (snake_case) → display name.
// Only needs to cover keys in ALGORITHM_TO_CONVERTER_KEY (algorithms with a frontend animation template).
// When adding a new algorithm: add its converter key in traceConverters and its display name here.
const ALGO_DISPLAY_NAME: Record<string, string> = {
  bubble_sort: 'Bubble Sort',
  selection_sort: 'Selection Sort',
  insertion_sort: 'Insertion Sort',
  linear_search: 'Linear Search',
  binary_search: 'Binary Search',
};

/**
 * Returns a deduplicated list of display names for algorithms that have a frontend animation template.
 * Approach B: derived dynamically from ALGORITHM_TO_CONVERTER_KEY, so new algorithms sync automatically.
 * Keys not found in ALGO_DISPLAY_NAME fall back to the raw key (prevents missing entries).
 */
export function getSupportedAlgoLabels(): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const key of Object.keys(ALGORITHM_TO_CONVERTER_KEY)) {
    const label = ALGO_DISPLAY_NAME[key] ?? key;
    if (!seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  }
  return labels;
}

/**
 * Builds Playground tour steps (approach A: interactive task style).
 * Static elements are introduced linearly; "Click Run" is an interactive step (waits for done before advancing); post-run panels are introduced with real data.
 */
export function buildPlaygroundTourSteps({
  runStage,
  lastRunOutcome,
  goAnimationTab,
  leftDockedId,
  isAlgoDialogOpen,
  t,
}: BuildPlaygroundTourArgs): TourStep[] {
  return [
    {
      id: 'code-editor',
      title: t('tour.steps.codeEditor.title'),
      description: t('tour.steps.codeEditor.description'),
      targetSelector: '[data-tour="pg-editor"]',
      placement: 'right',
    },
    {
      id: 'run-button',
      title: t('tour.steps.runButton.title'),
      description: t('tour.steps.runButton.description'),
      targetSelector: '[data-tour="pg-run"]',
      placement: 'bottom',
      interactive: true,
      // Wait for done before advancing, ensuring subsequent panels have real data (prevents race condition)
      advanceWhen: () => runStage === 'done',
      // Use the explicit lastRunOutcome rather than inferring from runStage.
      // 'none' = Run not clicked yet (or reset when the tour opened) — show static waiting hint instead of Codi.
      waitingState: () => (lastRunOutcome === 'none' ? 'idle' : lastRunOutcome === 'error' ? 'error' : 'running'),
      skipTargetStepId: 'algo-detection',
    },
    {
      id: 'algo-detection',
      title: t('tour.steps.algoDetection.title'),
      description: t('tour.steps.algoDetection.description'),
      targetSelector: '[data-tour="pg-tabbar"]',
      placement: 'bottom',
      interactive: true,
      // 彈窗關閉後條件立即成立，step 出現時就是 completed 狀態
      advanceWhen: () => !isAlgoDialogOpen,
      skipTargetStepId: 'tab-bar',
    },
    {
      id: 'tab-bar',
      title: t('tour.steps.tabBar.title'),
      description: t('tour.steps.tabBar.description'),
      targetSelector: '[data-tour="pg-tabbar"]',
      placement: 'bottom',
      onEnter: goAnimationTab,
    },
    {
      id: 'canvas',
      title: t('tour.steps.canvas.title'),
      description: t('tour.steps.canvas.description'),
      targetSelector: '[data-tour="pg-canvas"]',
      placement: 'left',
    },
    {
      id: 'control-bar',
      title: t('tour.steps.controlBar.title'),
      description: t('tour.steps.controlBar.description'),
      targetSelector: '[data-tour="pg-controlbar"]',
      placement: 'top',
    },
    {
      id: 'ai-analysis',
      title: t('tour.steps.aiAnalysis.title'),
      description: t('tour.steps.aiAnalysis.description'),
      targetSelector: '[data-tour="pg-ai"]',
      placement: 'bottom',
    },
    {
      id: 'right-panels',
      title: t('tour.steps.rightPanels.title'),
      description: t('tour.steps.rightPanels.description'),
      targetSelector: '[data-tour="pg-right-bar"]',
      placement: 'left',
    },
    {
      id: 'drag-dock',
      title: t('tour.steps.dragDock.title'),
      description: t('tour.steps.dragDock.description'),
      targetSelector: '[data-tour="pg-drag-icon"]',
      secondaryTargetSelector: '[data-tour="pg-left-bar"]',
      placement: 'left',
      interactive: true,
      advanceWhen: () => leftDockedId !== null,
      skipTargetStepId: 'history',
    },
    {
      id: 'history',
      title: t('tour.steps.history.title'),
      description: t('tour.steps.history.description'),
      targetSelector: '[data-tour="pg-history"]',
      placement: 'right',
    },
  ];
}
