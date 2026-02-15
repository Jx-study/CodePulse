/**
 * ResultModal - 練習結果彈窗組件
 *
 * 顯示測驗結果，包括：
 * - 分數總結
 * - 星級評分
 * - 錯題列表
 * - 操作按鈕
 */

import React from "react";
import type { PracticeResult, Question } from "@/types/practice";
import { PracticeService } from "@/services/PracticeService";
import Dialog from "@/shared/components/Dialog";
import Button from "@/shared/components/Button";
import StarRating from "@/shared/components/StarRating";
import WrongAnswerList from "./WrongAnswerList";
import styles from "./ResultModal.module.scss";
import AnalysisCard from "./AnalysisCard";

interface ResultModalProps {
  isOpen: boolean;
  result: PracticeResult;
  questions: Question[];
  onRetry: () => void;
  onBackToDashboard: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  result,
  questions,
  onRetry,
  onBackToDashboard,
}) => {
  const gradeText = PracticeService.getGradeText(result.stars);
  const encouragementText = PracticeService.getEncouragementText(result);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return mins > 0 ? `${mins} 分 ${secs} 秒` : `${secs} 秒`;
  };

  const renderRatingChange = () => {
    // 只有當 result 有包含 Elo 資料時才顯示 (相容舊版)
    if (result.newRating === undefined) return null;

    const delta = result.ratingDelta;
    const sign = delta >= 0 ? "+" : "";
    const colorClass =
      delta >= 0 ? styles.ratingPositive : styles.ratingNegative;

    return (
      <div className={styles.ratingContainer}>
        <span className={styles.ratingLabel}>能力值：</span>
        <span className={styles.ratingValue}>{result.newRating}</span>
        <span className={`${styles.ratingDelta} ${colorClass}`}>
          ({sign}
          {delta})
        </span>
      </div>
    );
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onBackToDashboard}
      size="md"
      title="測驗結果"
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

            {renderRatingChange()}

            <div className={styles.starContainer}>
              <StarRating value={result.stars} max={3} size="lg" readonly />
            </div>
          </div>
        </div>

        {result.analysis && <AnalysisCard analysis={result.analysis} />}

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{result.correctCount}</span>
            <span className={styles.statLabel}>正確</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{result.wrongCount}</span>
            <span className={styles.statLabel}>錯誤</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{result.totalQuestions}</span>
            <span className={styles.statLabel}>總題數</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {formatTime(result.timeSpent)}
            </span>
            <span className={styles.statLabel}>用時</span>
          </div>
        </div>

        {result.wrongQuestions.length > 0 && (
          <WrongAnswerList
            wrongQuestions={result.wrongQuestions}
            questions={questions}
          />
        )}

        <div className={styles.actions}>
          <Button
            variant="primaryOutline"
            onClick={onRetry}
            className={styles.retryButton}
          >
            再試一次
          </Button>
          <Button
            variant="primary"
            onClick={onBackToDashboard}
            className={styles.dashboardButton}
          >
            返回 Dashboard
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default React.memo(ResultModal);
