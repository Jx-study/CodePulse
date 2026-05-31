import { DESKTOP_STEPS, MOBILE_STEPS } from './featureTourSteps';
import TourEngine from '@/shared/components/TourEngine';

interface FeatureTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  isMobile: boolean;
}

/**
 * Tutorial 頁的功能導覽。
 * 引擎邏輯已抽至共用 TourEngine，本元件僅提供 Tutorial 專屬步驟與收尾文案。
 */
export default function FeatureTour({ isOpen, onComplete, onSkip, isMobile }: FeatureTourProps) {
  const steps = isMobile ? MOBILE_STEPS : DESKTOP_STEPS;
  return (
    <TourEngine
      isOpen={isOpen}
      steps={steps}
      onComplete={onComplete}
      onSkip={onSkip}
      finalTitle="準備好了嗎？"
      finalDescription="在開始練習前，先到知識補充站了解這個演算法的理論基礎吧！"
      finalPrimaryLabel="進入知識補充站"
      finalSecondaryLabel="暫時不需要，直接開始"
    />
  );
}
