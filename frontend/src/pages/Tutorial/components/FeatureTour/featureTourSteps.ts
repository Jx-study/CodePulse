export interface TourStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  targetSelector: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export const DESKTOP_STEPS: TourStep[] = [
  {
    id: 'swap-button',
    titleKey: 'featureTour.steps.swapButton.title',
    descriptionKey: 'featureTour.steps.swapButton.description',
    targetSelector: '[data-tour="swap-button"]',
    placement: 'bottom',
  },
  {
    id: 'resize-handle',
    titleKey: 'featureTour.steps.resizeHandle.title',
    descriptionKey: 'featureTour.steps.resizeHandle.description',
    targetSelector: '[data-tour="resize-handle"]',
    placement: 'right',
  },
  {
    id: 'resize-handle-v',
    titleKey: 'featureTour.steps.resizeHandleV.title',
    descriptionKey: 'featureTour.steps.resizeHandleV.description',
    targetSelector: '[data-tour="resize-handle-v"]',
    placement: 'right',
  },
  {
    id: 'canvas-panel',
    titleKey: 'featureTour.steps.canvasPanel.title',
    descriptionKey: 'featureTour.steps.canvasPanel.description',
    targetSelector: '[data-tour="canvas-panel"]',
    placement: 'left',
  },
  {
    id: 'control-bar',
    titleKey: 'featureTour.steps.controlBar.title',
    descriptionKey: 'featureTour.steps.controlBar.description',
    targetSelector: '[data-tour="control-bar"]',
    placement: 'top',
  },
  {
    id: 'code-panel',
    titleKey: 'featureTour.steps.codePanel.title',
    descriptionKey: 'featureTour.steps.codePanel.description',
    targetSelector: '[data-tour="code-panel"]',
    placement: 'right',
  },
];

export const MOBILE_STEPS: TourStep[] = DESKTOP_STEPS.slice(3);
