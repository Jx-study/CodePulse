import { useTranslation } from 'react-i18next';
import { buildFeatureTourSteps } from './featureTourSteps';
import TourEngine from '@/shared/components/TourEngine';

interface FeatureTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onDontShowAgain: () => void;
  isMobile: boolean;
}

/**
 * Feature tour for the Tutorial page.
 * Engine logic lives in the shared TourEngine; this component only provides Tutorial-specific steps and outro copy.
 */
export default function FeatureTour({ isOpen, onComplete, onSkip, onDontShowAgain, isMobile }: FeatureTourProps) {
  const { t } = useTranslation('tutorial');
  const allSteps = buildFeatureTourSteps(t);
  // Mobile 跳過前 3 步（swap-button, resize-handle, resize-handle-v）
  const steps = isMobile ? allSteps.slice(3) : allSteps;
  return (
    <TourEngine
      isOpen={isOpen}
      steps={steps}
      onComplete={onComplete}
      onSkip={onSkip}
      onDontShowAgain={onDontShowAgain}
      finalTitle={t('featureTour.outro.title')}
      finalDescription={t('featureTour.outro.description')}
      finalPrimaryLabel={t('featureTour.outro.primaryLabel')}
      finalSecondaryLabel={t('featureTour.outro.secondaryLabel')}
    />
  );
}
