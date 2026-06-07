import type { TFunction } from 'i18next';
import type { TourStep } from '@/shared/components/TourEngine';

export type { TourStep };

export function buildFeatureTourSteps(t: TFunction): TourStep[] {
  return [
    {
      id: 'swap-button',
      title: t('featureTour.steps.swapButton.title'),
      description: t('featureTour.steps.swapButton.description'),
      targetSelector: '[data-tour="swap-button"]',
      placement: 'bottom',
    },
    {
      id: 'resize-handle',
      title: t('featureTour.steps.resizeHandle.title'),
      description: t('featureTour.steps.resizeHandle.description'),
      targetSelector: '[data-tour="resize-handle"]',
      placement: 'right',
    },
    {
      id: 'resize-handle-v',
      title: t('featureTour.steps.resizeHandleV.title'),
      description: t('featureTour.steps.resizeHandleV.description'),
      targetSelector: '[data-tour="resize-handle-v"]',
      placement: 'right',
    },
    {
      id: 'canvas-panel',
      title: t('featureTour.steps.canvasPanel.title'),
      description: t('featureTour.steps.canvasPanel.description'),
      targetSelector: '[data-tour="canvas-panel"]',
      placement: 'left',
    },
    {
      id: 'control-bar',
      title: t('featureTour.steps.controlBar.title'),
      description: t('featureTour.steps.controlBar.description'),
      targetSelector: '[data-tour="control-bar"]',
      placement: 'top',
    },
    {
      id: 'code-panel',
      title: t('featureTour.steps.codePanel.title'),
      description: t('featureTour.steps.codePanel.description'),
      targetSelector: '[data-tour="code-panel"]',
      placement: 'right',
    },
  ];
}
