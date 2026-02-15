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
import CodeEditor from "@/modules/core/components/CodeEditor/CodeEditor";
import { getOptionLabel } from "@/utils/random";
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
    const option = question.options?.find((o) => o.id === optionId);
    return option ? `(${option.id}) ${option.text}` : optionId;
  };

  const formatAnswer = (
    question: Question,
    answer: string | string[],
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
        .join(",  ");
    }

    // 選擇題則嘗試轉換為選項文字
    if (Array.isArray(answer)) {
      return answer.map((a) => getOptionText(question, a)).join(", ");
    }
    return getOptionText(question, answer);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const renderTimeAnalysis = (seconds: number) => {
    let label = "";
    let colorClass = "";

    if (seconds < 5) {
      label = "秒殺 (粗心？)";
      colorClass = styles.timeFast;
    } else if (seconds > 60) {
      label = "思考久 (卡關？)";
      colorClass = styles.timeSlow;
    } else {
      label = `${seconds}s`;
      colorClass = styles.timeNormal;
    }

    return <span className={`${styles.timeBadge} ${colorClass}`}>{label}</span>;
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
                  {renderTimeAnalysis(wrongQ.timeSpent)}
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

                  {/* 1. 如果有程式碼，顯示 CodeEditor */}
                  <div className={styles.contextSection}>
                    {question.code && (
                      <div className={styles.reviewCodeBlock}>
                        <CodeEditor
                          mode="single"
                          language={question.language || "python"}
                          value={question.code}
                          readOnly={true}
                          theme="auto"
                          showLineNumbers={true}
                          className={styles.reviewEditor}
                        />
                      </div>
                    )}
                    {question.options && question.options.length > 0 && (
                      <div className={styles.reviewOptionList}>
                        {question.options.map((opt, i) => {
                          // 判斷是否為正確答案
                          const isCorrect = Array.isArray(wrongQ.correctAnswer)
                            ? wrongQ.correctAnswer.includes(opt.id)
                            : wrongQ.correctAnswer === opt.id;

                          // 判斷用戶是否選擇了這個 (包含選錯的)
                          const isUserSelected = Array.isArray(
                            wrongQ.userAnswer,
                          )
                            ? wrongQ.userAnswer.includes(opt.id)
                            : wrongQ.userAnswer === opt.id;

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
                                <span className={styles.iconCheck}>✅</span>
                              )}
                              {isUserSelected && !isCorrect && (
                                <span className={styles.iconCross}>❌</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

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
