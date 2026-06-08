// Shared tour engine type definitions.
// Interactive fields are all optional: omitting them makes the step a traditional linear step (Next/Previous).

export interface TourStep {
  id: string;
  title: string;
  description: string;
  /** Target element CSS selector, e.g. [data-tour="run-button"] */
  targetSelector: string;
  /** Optional: second spotlight target, for steps that need to highlight two elements simultaneously */
  secondaryTargetSelector?: string;
  placement: 'top' | 'bottom' | 'left' | 'right';

  // ── Interactive mode (direction B) optional fields ──
  /** When true, hides the Next button and shows a "Waiting for action…" hint with a "Skip step" link */
  interactive?: boolean;
  /**
   * Advance condition for interactive steps. The engine checks this in the rAF loop and auto-advances when it returns true.
   * Pass a closure from the caller (e.g. () => runStage !== 'idle').
   */
  advanceWhen?: () => boolean;
  /** Called once when entering this step, used to drive UI (e.g. switch tab, expand panel) */
  onEnter?: () => void;
  /**
   * Called when "Skip step" is clicked on an interactive step.
   * Use for side effects owned by the caller; navigation is handled by skipTargetStepId or the engine fallback.
   */
  onSkipStep?: () => void;
  /**
   * Optional dependency-aware target for "Skip step" on interactive steps.
   * When set, the engine jumps to this step id instead of blindly advancing to the next step.
   */
  skipTargetStepId?: string;
  /**
   * Sub-state while an interactive step is waiting. The engine uses this to switch the mascot between running / error appearance.
   * Returns 'error' to show the error mascot; otherwise ('running' / 'idle') shows the companion waiting state.
   * Pass a closure from the caller (e.g. () => lastRunOutcome === 'error' ? 'error' : 'running').
   */
  waitingState?: () => 'running' | 'error' | 'idle';
}

export interface TourEngineProps {
  isOpen: boolean;
  steps: TourStep[];
  /** Called when the final step is completed (primary button on the outro card) */
  onComplete: () => void;
  /** Called when the tour is closed (×, Esc, or secondary button on the outro card) */
  onSkip: () => void;
  /** Primary button label on the outro card, default "Done" */
  finalPrimaryLabel?: string;
  /** Secondary button label on the outro card, default "Close" */
  finalSecondaryLabel?: string;
  /** Title on the outro card, default "Ready?" */
  finalTitle?: string;
  /** Description text on the outro card */
  finalDescription?: string;
  /** Optional: adds a "Don't show again" button at the bottom, calling this when clicked */
  onDontShowAgain?: () => void;
  /**
   * Optional: pause the tour. When true, hides the spotlight/tooltip and stops rAF tracking,
   * but does NOT reset the step (separate from isOpen). Used to yield to overlaying dialogs;
   * resumes at the same step when the dialog closes (isPaused returns to false).
   */
  isPaused?: boolean;
}
