/**
 * WrongAnswerList - 錯題列表組件
 *
 * 顯示用戶答錯的題目，包括：
 * - 題目內容
 * - 用戶答案
 * - 正確答案
 * - 答案解析
 */

import React, { useState } from "react";
import type { WrongQuestion, Question } from "@/types/practice";
import styles from "./ResultModal.module.scss";

interface WrongAnswerListProps {
  wrongQuestions: WrongQuestion[];
  questions: Question[];
}

const WrongAnswerList: React.FC<WrongAnswerListProps> = ({
  wrongQuestions,
  questions,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const getQuestionById = (questionId: string): Question | undefined => {
    return questions.find((q) => q.id === questionId);
  };

  const getOptionText = (question: Question, optionId: string): string => {
    const option = question.options.find((o) => o.id === optionId);
    return option ? `(${option.id}) ${option.text}` : optionId;
  };

  const formatAnswer = (
    question: Question,
    answer: string | string[],
  ): string => {
    if (Array.isArray(answer)) {
      return answer.map((a) => getOptionText(question, a)).join(", ");
    }
    return getOptionText(question, answer);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className={styles.wrongAnswerSection}>
      <h4 className={styles.wrongAnswerTitle}>
        錯題回顧 ({wrongQuestions.length} 題)
      </h4>

      <div className={styles.wrongAnswerList}>
        {wrongQuestions.map((wrongQ, index) => {
          const question = getQuestionById(wrongQ.questionId);
          if (!question) return null;

          const isExpanded = expandedIndex === index;

          return (
            <div key={wrongQ.questionId} className={styles.wrongAnswerItem}>
              <button
                type="button"
                className={styles.wrongAnswerHeader}
                onClick={() => toggleExpand(index)}
                aria-expanded={isExpanded}
              >
                <span className={styles.questionNumber}>
                  第 {index + 1} 題
                  <span className={styles.difficultyBadge}>
                    (Rating: {question.difficultyRating || "N/A"})
                  </span>
                </span>
                <span className={styles.questionPreview}>
                  {question.title.length > 50
                    ? `${question.title.substring(0, 50)}...`
                    : question.title}
                </span>
                <span className={styles.expandIcon}>
                  {isExpanded ? "−" : "+"}
                </span>
              </button>

              {isExpanded && (
                <div className={styles.wrongAnswerDetail}>
                  <p className={styles.fullQuestion}>{question.title}</p>

                  <div className={styles.answerComparison}>
                    <div className={styles.userAnswer}>
                      <span className={styles.answerLabel}>你的答案：</span>
                      <span className={styles.answerValue}>
                        {wrongQ.userAnswer
                          ? formatAnswer(question, wrongQ.userAnswer)
                          : "未作答"}
                      </span>
                    </div>
                    <div className={styles.correctAnswer}>
                      <span className={styles.answerLabel}>正確答案：</span>
                      <span className={styles.answerValue}>
                        {formatAnswer(question, wrongQ.correctAnswer)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.explanation}>
                    <span className={styles.explanationLabel}>解析：</span>
                    <p className={styles.explanationText}>
                      {wrongQ.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(WrongAnswerList);
