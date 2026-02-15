import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type {
  PracticeResult,
  PracticeSession,
  Question,
} from "@/types/practice";
import { getQuizByLevelId } from "@/data/questions";
import { PracticeService } from "@/services/PracticeService";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { ResultModal } from "./components/ResultModal";
import type { BreadcrumbItem } from "@/types";
import styles from "./Practice.module.scss";
import {
  shuffleQuestionsWithGroups,
  shuffleArray,
  getOptionLabel,
} from "@/utils/random";
import CodeEditor from "@/modules/core/components/CodeEditor/CodeEditor";
import Input from "@/shared/components/Input";

const GROUP_COLORS = ["#4a90e2", "#66bb6a", "#ab47bc", "#ff7043", "#26c6da"];

function Practice() {
  const { category, levelId } = useParams<{
    category: string;
    levelId: string;
  }>();
  const navigate = useNavigate();

  const originalQuiz = useMemo(() => {
    if (!levelId) return null;
    return getQuizByLevelId(levelId);
  }, [levelId]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>(
    [],
  );
  const [retryCount, setRetryCount] = useState(0);
  const [userAnswers, setUserAnswers] = useState<
    Record<string, string | string[]>
  >({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [startTime, setStartTime] = useState(Date.now());

  const getCurrentGroup = (question: Question) => {
    if (!question.groupId || !originalQuiz?.groups) return null;
    return originalQuiz.groups.find((g) => g.id === question.groupId);
  };

  const activeGroupIds = useMemo(() => {
    const ids: string[] = [];
    randomizedQuestions.forEach((q) => {
      if (q.groupId && !ids.includes(q.groupId)) {
        ids.push(q.groupId);
      }
    });
    return ids;
  }, [randomizedQuestions]);

  useEffect(() => {
    if (!originalQuiz) return;

    const shuffledQuestionsList = shuffleQuestionsWithGroups(
      originalQuiz.questions,
    );

    // 選項隨機化
    const finalQuestions = shuffledQuestionsList.map((q) => {
      const newQ = { ...q };

      if (
        q.type !== "true-false" &&
        q.type !== "predict-line" &&
        q.type !== "fill-code"
      ) {
        if (newQ.options) newQ.options = shuffleArray(newQ.options);
      }
      return newQ;
    });

    setRandomizedQuestions(finalQuestions);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setStartTime(Date.now());
    setShowResult(false);
    setResult(null);
  }, [originalQuiz, retryCount]);

  const handleSelectQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleNext = () => {
    if (originalQuiz && currentQuestionIndex < randomizedQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleAnswerChange = (
    questionId: string,
    optionId: string,
    isMultiple: boolean,
  ) => {
    setUserAnswers((prev) => {
      const currentAnswer = prev[questionId];

      if (isMultiple) {
        const currentList = Array.isArray(currentAnswer) ? currentAnswer : [];
        if (currentList.includes(optionId)) {
          // 取消勾選
          return {
            ...prev,
            [questionId]: currentList.filter((id) => id !== optionId),
          };
        } else {
          // 勾選
          return { ...prev, [questionId]: [...currentList, optionId] };
        }
      } else {
        // 單選/是非邏輯
        return { ...prev, [questionId]: optionId };
      }
    });
  };

  const handleFillCodeChange = (
    questionId: string,
    index: number,
    value: string,
  ) => {
    setUserAnswers((prev) => {
      const currentArr = Array.isArray(prev[questionId])
        ? [...(prev[questionId] as string[])]
        : [];

      currentArr[index] = value;
      return { ...prev, [questionId]: currentArr };
    });
  };

  const handleSubmit = () => {
    if (!originalQuiz) return;

    const session: PracticeSession = {
      sessionId: `session-${Date.now()}`,
      levelId: originalQuiz.levelId,
      questions: originalQuiz.questions,
      userAnswers,
      startTime,
      endTime: Date.now(),
      status: "completed",
      userStartRating: 1000, // TODO: 目前先寫死為 1000 (預設值)，未來可從 UserContext 獲取
    };

    const calculatedResult = PracticeService.calculateResult(session);
    setResult(calculatedResult);
    setShowResult(true);
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  if (randomizedQuestions.length === 0) return <div>Loading...</div>;

  if (!originalQuiz) {
    return (
      <div className={styles.practicePage}>
        <div className={styles.errorContainer}>
          <h2 className={styles.errorTitle}>找不到題庫</h2>
          <p className={styles.errorMessage}>
            抱歉，無法找到「{levelId}」的練習題庫。請返回 Dashboard
            選擇其他關卡。
          </p>
          <button
            className={styles.errorButton}
            onClick={handleBackToDashboard}
          >
            返回 Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = randomizedQuestions[currentQuestionIndex];
  const currentGroup = getCurrentGroup(currentQuestion);
  const isMultipleChoice = currentQuestion.type === "multiple-choice";
  const isPredictLineQuestion = currentQuestion.type === "predict-line";
  const isFillCodeQuestion = currentQuestion.type === "fill-code";
  const showCodeEditor = isPredictLineQuestion || isFillCodeQuestion;
  const answeredCount = Object.keys(userAnswers).length;
  const isLastQuestion =
    currentQuestionIndex === randomizedQuestions.length - 1;
  const canSubmit = answeredCount === randomizedQuestions.length;

  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label:
        category === "data-structures" ? "資料結構" : category || "未知分類",
      path: `/dashboard?category=${category}`,
    },
    { label: originalQuiz.levelName, path: null },
  ];

  return (
    <div className={styles.practicePage}>
      <div className={styles.breadcrumbContainer}>
        <Breadcrumb items={breadcrumbItems} showBackButton={true} />
      </div>

      <div className={styles.practiceLayout}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>題目列表</h3>
            <div className={styles.questionList}>
              {/* 判斷是否為題組，給予特殊樣式 */}
              {randomizedQuestions.map((q, index) => {
                const group = getCurrentGroup(q);

                let groupIndex = -1;
                let groupColor = "transparent";

                if (group && q.groupId) {
                  groupIndex = activeGroupIds.indexOf(q.groupId);
                  groupColor = GROUP_COLORS[groupIndex % GROUP_COLORS.length];
                }

                const prevQ = randomizedQuestions[index - 1];
                const isNewSection = index > 0 && q.groupId !== prevQ?.groupId;

                let itemClass = styles.questionItem;
                if (index === currentQuestionIndex)
                  itemClass += ` ${styles.active}`;
                if (userAnswers[q.id]) itemClass += ` ${styles.answered}`;

                const itemStyle: React.CSSProperties = {};

                // 設定題組標示線顏色
                if (group) {
                  itemStyle.borderLeft = `4px solid ${groupColor}`;
                }

                // 設定物理間距
                if (isNewSection) {
                  itemStyle.marginTop = "12px";
                }

                const groupStyle = group
                  ? {
                      borderLeft: "4px solid #4a90e2",
                    }
                  : {};

                return (
                  <button
                    key={q.id}
                    className={itemClass}
                    style={groupStyle}
                    onClick={() => handleSelectQuestion(index)}
                  >
                    {group && (
                      <span
                        style={{
                          color: groupColor,
                          fontWeight: "bold",
                          marginRight: "4px",
                          fontSize: "12px",
                        }}
                      >
                        G{groupIndex + 1}.
                      </span>
                    )}
                    題目 {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>進度</h3>
            <p>
              已答題: {answeredCount} / {randomizedQuestions.length}
            </p>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>通關條件</h3>
            <ul className={styles.requirementList}>
              <li>正確率 {originalQuiz.passingScore}% 以上</li>
              <li>完成所有題目</li>
            </ul>
          </div>

          <button
            className={styles.submitAllButton}
            onClick={handleSubmit}
            disabled={answeredCount < randomizedQuestions.length}
          >
            提交全部
          </button>
        </div>

        <div className={styles.workspace}>
          {currentGroup && (
            <div className={styles.groupContextContainer}>
              <div className={styles.groupHeader}>
                <span className={styles.groupBadge}>題組</span>
                <h3 className={styles.groupTitle}>{currentGroup.title}</h3>
              </div>

              <div className={styles.groupContent}>
                <p className={styles.groupDesc}>{currentGroup.description}</p>
                {currentGroup.code && (
                  <div className={styles.groupCodeBlock}>
                    <CodeEditor
                      mode="single"
                      language={currentGroup.language || "python"}
                      value={currentGroup.code}
                      readOnly={true}
                      theme="auto"
                      showLineNumbers={true}
                      className={styles.groupEditor}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <div className={styles.questionHeader}>
            <h2 className={styles.questionTitle}>
              題目 {currentQuestionIndex + 1} of {randomizedQuestions.length}
              <span className={styles.typeBadge}>
                {isMultipleChoice
                  ? " (多選)"
                  : isPredictLineQuestion
                    ? " (行數填空)"
                    : currentQuestion.type === "true-false"
                      ? " (是非)"
                      : currentQuestion.type === "fill-code"
                        ? "程式填空"
                        : " (單選)"}
              </span>
            </h2>
          </div>

          <div className={styles.questionContent}>
            <p className={styles.questionText}>{currentQuestion.title}</p>

            {showCodeEditor && currentQuestion.code && (
              <div
                style={{
                  marginTop: "16px",
                  marginBottom: "16px",
                  border: "1px solid #444",
                  borderRadius: "4px",
                  overflow: "hidden",
                  height: "400px",
                }}
              >
                <CodeEditor
                  key={`editor-${currentQuestion.id}`} // 切換題目時重置
                  mode="single"
                  language={currentQuestion.language || "python"}
                  value={currentQuestion.code}
                  readOnly={true}
                  theme="auto"
                  showLineNumbers={true}
                />
              </div>
            )}

            {isPredictLineQuestion ? (
              <div style={{ marginTop: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  請輸入行號 (例如: 12 13 15)：
                </label>
                <Input
                  type="text"
                  value={(userAnswers[currentQuestion.id] as string) || ""}
                  onChange={(e) =>
                    handleAnswerChange(
                      currentQuestion.id,
                      e.target.value,
                      false,
                    )
                  }
                  placeholder="輸入答案..."
                />
              </div>
            ) : isFillCodeQuestion ? (
              <div className={styles.fillCodeInputs}>
                <p
                  style={{
                    color: "#aaa",
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                >
                  請在下方填入對應代號的值：
                </p>
                {currentQuestion.options?.map((opt, index) => {
                  const currentAnsArray =
                    (userAnswers[currentQuestion.id] as string[]) || [];
                  return (
                    <div
                      key={opt.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <label
                        style={{
                          width: "40px",
                          color: "#4a90e2",
                          fontWeight: "bold",
                          fontFamily: "monospace",
                          fontSize: "16px",
                        }}
                      >
                        ({opt.id})
                      </label>
                      <Input
                        type="text"
                        value={currentAnsArray[index] || ""}
                        onChange={(e) =>
                          handleFillCodeChange(
                            currentQuestion.id,
                            index,
                            e.target.value,
                          )
                        }
                        placeholder={`填入 (${opt.id}) 的答案...`}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.optionList}>
                {currentQuestion.options?.map((option, index) => {
                  const currentAns = userAnswers[currentQuestion.id];
                  const isChecked = isMultipleChoice
                    ? Array.isArray(currentAns) &&
                      currentAns.includes(option.id)
                    : currentAns === option.id;
                  return (
                    <label
                      key={option.id}
                      className={`${styles.optionItem} ${
                        userAnswers[currentQuestion.id] === option.id
                          ? styles.selected
                          : ""
                      }`}
                    >
                      <input
                        type={isMultipleChoice ? "checkbox" : "radio"}
                        name={currentQuestion.id}
                        value={option.id}
                        checked={isChecked}
                        onChange={() =>
                          handleAnswerChange(
                            currentQuestion.id,
                            option.id,
                            isMultipleChoice,
                          )
                        }
                        className={styles.optionInput}
                      />
                      <span className={styles.optionLabel}>
                        ({getOptionLabel(index)}) {option.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.actionButtons}>
            <button
              className={styles.navButton}
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
            >
              上一題
            </button>
            <button
              className={styles.navButton}
              onClick={isLastQuestion ? handleSubmit : handleNext}
              disabled={isLastQuestion ? !canSubmit : false}
            >
              {isLastQuestion ? "提交" : "下一題"}
            </button>
          </div>
        </div>
      </div>

      {showResult && result && (
        <ResultModal
          isOpen={showResult}
          result={result}
          questions={randomizedQuestions}
          onRetry={handleRetry}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </div>
  );
}

export default Practice;
