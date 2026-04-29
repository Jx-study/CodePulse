/**
 * AnswerList - 答題回顧列表組件
 *
 * 顯示所有題目的答題結果，包括：
 * - 題目內容
 * - 用戶答案
 * - 正確答案
 * - 答案解析
 * - 得分
 */

import React, { useState, lazy, Suspense } from "react";
import type { AnswerResult, Question } from "@/types/practice";
const CodeEditor = lazy(() => import("@/modules/core/components/CodeEditor/CodeEditor"));
import Badge from "@/shared/components/Badge";
import Button from "@/shared/components/Button";
import Icon from "@/shared/components/Icon";
import { getOptionLabel } from "@/utils/random";
import styles from "./AnswerList.module.scss";

interface AnswerListProps {
  answerResults: AnswerResult[];
  questions: Question[];
}

const AnswerList: React.FC<AnswerListProps> = ({
  answerResults,
  questions,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const getQuestionById = (questionId: string): Question | undefined => {
    return questions.find((q) => q.id === questionId);
  };

  const getOptionText = (question: Question, optionId: string): string => {
    const option = question.options?.find((o) => o.id === optionId);
    return option ? `(${option.id}) ${option.text}` : optionId;
  };

  const formatAnswer = (
    question: Question,
    answer: string | string[] | (string | string[])[],
  ): string => {
    // 如果是填充題/預測行數，直接回傳答案
    if (question.type === "predict-line") {
      return Array.isArray(answer) ? answer.join(" ") : answer;
    }

    if (question.type === "fill-code" && Array.isArray(answer)) {
      // 顯示格式如：(a) 0, (b) self.capacity, (c) 0
      return answer
        .map((val, idx) => {
          const label = question.options?.[idx]?.id || `?`;
          return `(${label}) ${val || "(空)"}`;
        })
        .join(" ");
    }

    // 嘗試解析 JSON 字串（後端多選題 correct_answer 為 JSON array 字串）
    let resolved: string | string[] | (string | string[])[] = answer;
    if (typeof answer === "string") {
      try {
        const parsed = JSON.parse(answer);
        if (Array.isArray(parsed)) resolved = parsed;
      } catch {
        // not JSON, keep as-is
      }
    }

    // 選擇題則嘗試轉換為選項文字
    if (Array.isArray(resolved)) {
      return resolved.map((a) => getOptionText(question, Array.isArray(a) ? a.join(" ") : a)).join(" ");
    }
    return getOptionText(question, resolved);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const renderTimeAnalysis = (seconds: number) => {
    if (seconds < 5) {
      return <Badge variant="warning" size="xs" shape="rounded">{seconds}s（秒殺）</Badge>;
    }
    if (seconds > 60) {
      return <Badge variant="secondary" size="xs" shape="rounded">{seconds}s（卡關？）</Badge>;
    }
    return <Badge variant="info" size="xs" shape="rounded">{seconds}s</Badge>;
  };

  return (
    <div className={styles.answerSection}>
      <h4 className={styles.answerTitle}>
        答題回顧 ({answerResults.length} 題)
      </h4>

      <div className={styles.answerList}>
        {answerResults.map((ar, index) => {
          const question = getQuestionById(ar.questionId);
          if (!question) return null;

          const isExpanded = expandedIndex === index;
          const correctClass = ar.isCorrect ? styles.correct : styles.wrong;

          return (
            <div
              key={ar.questionId}
              className={`${styles.answerItem} ${correctClass}`}
            >
              <Button
                type="button"
                variant="ghost"
                className={`${styles.answerHeader} ${correctClass}`}
                onClick={() => toggleExpand(index)}
                aria-expanded={isExpanded}
              >
                <span className={`${styles.questionNumber} ${correctClass}`}>
                  第 {index + 1} 題
                  {renderTimeAnalysis(ar.timeSpent)}
                </span>
                <span className={styles.questionPreview}>
                  {question.title.length > 50
                    ? `${question.title.substring(0, 50)}...`
                    : question.title}
                </span>
                <span className={styles.expandIcon}>
                  {isExpanded ? (
                    <Icon name="chevron-up" />
                  ) : (
                    <Icon name="chevron-down" />
                  )}
                </span>
              </Button>

              {isExpanded && (
                <div className={styles.answerDetail}>
                  <p className={styles.fullQuestion}>{question.title}</p>

                  {/* 1. 如果有程式碼，顯示 CodeEditor */}
                  <div className={styles.contextSection}>
                    {question.code && (
                      <Suspense fallback={null}>
                        <CodeEditor
                          mode="single"
                          language={question.language || "python"}
                          value={question.code}
                          readOnly={true}
                          theme="auto"
                          showLineNumbers={true}
                          autoHeight={true}
                        />
                      </Suspense>
                    )}
                    {question.options && question.options.length > 0 && (
                      <div className={styles.reviewOptionList}>
                        {question.options.map((opt, i) => {
                          // 判斷是否為正確答案（correct_answer 可能是 JSON array 字串）
                          let parsedCorrect: string | string[] = ar.correctAnswer as string;
                          if (typeof ar.correctAnswer === "string") {
                            try {
                              const p = JSON.parse(ar.correctAnswer);
                              if (Array.isArray(p)) parsedCorrect = p;
                            } catch { /* keep as string */ }
                          }
                          const isCorrect = Array.isArray(parsedCorrect)
                            ? parsedCorrect.includes(opt.id)
                            : parsedCorrect === opt.id;

                          // 判斷用戶是否選擇了這個 (包含選錯的)
                          const isUserSelected = Array.isArray(ar.userAnswer)
                            ? ar.userAnswer.includes(opt.id)
                            : ar.userAnswer === opt.id;

                          let optionClass = styles.reviewOptionItem;
                          if (isCorrect) optionClass += ` ${styles.optCorrect}`;
                          if (isUserSelected && !isCorrect)
                            optionClass += ` ${styles.optWrong}`;

                          return (
                            <div key={opt.id} className={optionClass}>
                              <span className={styles.optLabel}>
                                ({getOptionLabel(i)})
                              </span>
                              <span className={styles.optText}>{opt.text}</span>
                              {isCorrect && (
                                <span className={styles.iconCheck}>
                                  <Icon name="check" color="success" />
                                </span>
                              )}
                              {isUserSelected && !isCorrect && (
                                <span className={styles.iconCross}>
                                  <Icon name="times" color="danger" />
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className={styles.answerComparison}>
                    <div className={`${styles.userAnswerRow} ${ar.isCorrect ? styles.correct : styles.wrong}`}>
                      <span className={styles.answerLabel}>你的答案：</span>
                      <span className={styles.answerValue}>
                        {ar.userAnswer
                          ? formatAnswer(question, ar.userAnswer)
                          : "未作答"}
                      </span>
                    </div>
                    <div className={styles.correctAnswer}>
                      <span className={styles.answerLabel}>正確答案：</span>
                      <span className={styles.answerValue}>
                        {formatAnswer(question, ar.correctAnswer)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.explanation}>
                    <span className={styles.explanationLabel}>解析：</span>
                    <p className={styles.explanationText}>
                      {ar.explanation}
                    </p>
                  </div>

                  <Badge variant="primary" size="sm" shape="rounded">{ar.points} 分</Badge>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(AnswerList);