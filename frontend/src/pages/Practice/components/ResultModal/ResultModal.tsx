/**
 * ResultModal - 練習結果彈窗組件
 *
 * 顯示測驗結果，包括：
 * - 分數總結
 * - 星級評分
 * - 段位進度條
 * - 錯題列表
 * - 操作按鈕
 */

import React from "react";
import { useTranslation } from "react-i18next";
import type { PracticeResult, Question } from "@/types/practice";
import { PracticeService } from "@/services/PracticeService";
import Dialog from "@/shared/components/Dialog";
import Button from "@/shared/components/Button";
import StarRating from "@/shared/components/StarRating";
import AnswerList from "./AnswerList";
import styles from "./ResultModal.module.scss";
import ProgressBar from "@/shared/components/ProgressBar";

interface ResultModalProps {
  isOpen: boolean;
  result: PracticeResult;
  questions: Question[];
  onRetry: () => void;
  onBackToDashboard: () => void;
}

const TIER_THRESHOLDS = [0, 1150, 1350, 1550, 1750, 2000];

const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  result,
  questions,
  onRetry,
  onBackToDashboard,
}) => {
  const { t } = useTranslation('practice');
  const gradeText = PracticeService.getGradeText(result.stars);
  const encouragementText = PracticeService.getEncouragementText(result);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return mins > 0 ? `${mins} 分 ${secs} 秒` : `${secs} 秒`;
  };

  const renderTierProgress = () => {
    if (result.newRating === undefined) return null;

    const rating = Math.min(result.newRating, 2000);
    const tierIndex = TIER_THRESHOLDS.findIndex((t) => rating < t) - 1;
    const safeTier = Math.min(Math.max(tierIndex, 0), 4);
    const tierMin = TIER_THRESHOLDS[safeTier];
    const tierMax = TIER_THRESHOLDS[safeTier + 1];
    const progress = Math.min(((rating - tierMin) / (tierMax - tierMin)) * 100, 100);

    const delta = result.ratingDelta;
    const sign = delta >= 0 ? "+" : "";
    const deltaClass = delta >= 0 ? styles.ratingPositive : styles.ratingNegative;

    const oldTierIndex = result.oldRating !== undefined
      ? Math.min(Math.max(TIER_THRESHOLDS.findIndex((t) => (result.oldRating ?? 0) < t) - 1, 0), 4)
      : safeTier;
    const promoted = oldTierIndex < safeTier;

    return (
      <div className={styles.tierContainer}>
        <div className={styles.tierHeader}>
          <span className={styles.tierLabel}>
            {t('result.tier.label')}：<strong>{t(`result.tier.names.${safeTier + 1}`)}</strong>
          </span>
          <span className={`${styles.ratingDelta} ${deltaClass}`}>{sign}{delta}</span>
        </div>
        {promoted && <div className={styles.promotionBadge}>{t('result.tier.promoted')}</div>}
        <ProgressBar
          value={progress}
          max={100}
          showLabel={false}
          size="sm"
          animated
          aria-label={t('result.tier.label')}
        />
      </div>
    );
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onBackToDashboard}
      size="md"
      title={t('result.title')}
      closeOnOverlayClick={false}
      showCloseButton={false}
      className={styles.resultDialog}
    >
      <div className={styles.resultContent}>
        <div className={styles.scoreSummary}>
          <div className={styles.scoreCircle} data-passed={result.isPassed}>
            <span className={styles.scoreValue}>{result.score}</span>
            <span className={styles.scoreLabel}>分</span>
          </div>

          <div className={styles.scoreDetails}>
            <h3 className={styles.gradeText}>{gradeText}</h3>
            <p className={styles.encouragementText}>{encouragementText}</p>

            {renderTierProgress()}

            <div className={styles.starContainer}>
              <StarRating value={result.stars} max={3} size="lg" readonly />
            </div>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{result.correctCount}</span>
            <span className={styles.statLabel}>{t('result.correct')}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{result.wrongCount}</span>
            <span className={styles.statLabel}>{t('result.wrong')}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{result.totalQuestions}</span>
            <span className={styles.statLabel}>{t('result.total')}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {formatTime(result.timeSpent)}
            </span>
            <span className={styles.statLabel}>{t('result.timeSpent')}</span>
          </div>
        </div>

        <AnswerList
          answerResults={result.answerResults}
          questions={questions}
        />

        <div className={styles.actions}>
          <Button
            variant="primaryOutline"
            onClick={onRetry}
            className={styles.retryButton}
          >
            {t('result.retry')}
          </Button>
          <Button
            variant="primary"
            onClick={onBackToDashboard}
            className={styles.dashboardButton}
          >
            {t('result.backToDashboard')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default React.memo(ResultModal);
