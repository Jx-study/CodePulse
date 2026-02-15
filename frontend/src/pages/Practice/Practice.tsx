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
import { shuffleArray, getOptionLabel } from "@/utils/random";
import CodeEditor from "@/modules/core/components/CodeEditor/CodeEditor";
import Input from "@/shared/components/Input";

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

  useEffect(() => {
    if (!originalQuiz) return;

    const shuffledQuestions = shuffleArray(originalQuiz.questions).map((q) => {
      const newQ = { ...q };

      // 如果不是是非題，則隨機打亂選項順序
      // (是非題通常固定 True 在前或 False 在前比較符合習慣，也可隨機)
      if (
        q.type !== "true-false" &&
        q.type !== "predict-line" &&
        newQ.options
      ) {
        newQ.options = shuffleArray(newQ.options);
      }
      return newQ;
    });

    setRandomizedQuestions(shuffledQuestions);
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
  const isMultipleChoice = currentQuestion.type === "multiple-choice";
  const isCodeQuestion = currentQuestion.type === "predict-line";
  const answeredCount = Object.keys(userAnswers).length;

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
              {randomizedQuestions.map((q, index) => (
                <button
                  key={q.id}
                  className={`${styles.questionItem} ${
                    index === currentQuestionIndex ? styles.active : ""
                  } ${userAnswers[q.id] ? styles.answered : ""}`}
                  onClick={() => handleSelectQuestion(index)}
                >
                  題目 {index + 1}
                </button>
              ))}
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
          <div className={styles.questionHeader}>
            <h2 className={styles.questionTitle}>
              題目 {currentQuestionIndex + 1} of {randomizedQuestions.length}
              <span className={styles.typeBadge}>
                {isMultipleChoice
                  ? " (多選)"
                  : isCodeQuestion
                    ? " (填空)"
                    : currentQuestion.type === "true-false"
                      ? " (是非)"
                      : " (單選)"}
              </span>
            </h2>
          </div>

          <div className={styles.questionContent}>
            <p className={styles.questionText}>{currentQuestion.title}</p>

            {isCodeQuestion && currentQuestion.code && (
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

            {isCodeQuestion ? (
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
              onClick={handleNext}
              disabled={currentQuestionIndex === randomizedQuestions.length - 1}
            >
              下一題
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
