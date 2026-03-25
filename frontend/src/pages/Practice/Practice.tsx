import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type {
  PracticeResult,
  Question,
  AnswerResult,
} from "@/types/practice";
import { PracticeService } from "@/services/PracticeService";
import { tutorialService } from "@/services/tutorialService";
import type { ApiQuestion } from "@/services/tutorialService";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { ResultModal } from "./components/ResultModal";
import type { BreadcrumbItem } from "@/types";
import styles from "./Practice.module.scss";
import { shuffleArray, getOptionLabel } from "@/utils/random";
import CodeEditor from "@/modules/core/components/CodeEditor/CodeEditor";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import { useAuth } from "@/shared/contexts/AuthContext";
import { toast } from "@/shared/components/Toast";

const GROUP_COLORS = ["#4a90e2", "#66bb6a", "#ab47bc", "#ff7043", "#26c6da"];
const DEFAULT_RATING = 1000;

function mapApiQuestionsToLocal(apiQuestions: ApiQuestion[]): Question[] {
  return apiQuestions.map((q) => ({
    id: String(q.question_id),
    backendId: q.question_id,
    type: q.question_type,
    category: q.category,
    title: q.stem,
    options: q.options ?? undefined,
    code: q.code ?? undefined,
    language: q.language ?? undefined,
    groupId: q.group_id ? String(q.group_id) : undefined,
    group: q.group ?? undefined,
    correctAnswer: '',
    explanation: '',
  }));
}

function Practice() {
  const { category, levelId } = useParams<{
    category: string;
    levelId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserRating = user?.skill_rating ?? DEFAULT_RATING;

  // 從後端載入題目
  const [apiQuestions, setApiQuestions] = useState<Question[] | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!levelId) return;
    setIsLoadingQuestions(true);
    tutorialService.getQuestions(levelId)
      .then((apiQs) => {
        setApiQuestions(mapApiQuestionsToLocal(apiQs));
      })
      .catch(() => setLoadError('無法載入題目，請重新整理'))
      .finally(() => setIsLoadingQuestions(false));
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

  // 記錄每一題的累積時間
  const [timeRecords, setTimeRecords] = useState<Record<string, number>>({});
  // 記錄當前題目「開始看題」的時間點
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const getCurrentGroup = (question: Question) => {
    if (!question.groupId) return null;
    const q = randomizedQuestions.find((q) => q.id === question.id);
    return q?.group ?? null;
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

  const updateTimeRecord = () => {
    const now = Date.now();
    const duration = now - questionStartTime;
    const currentQId = randomizedQuestions[currentQuestionIndex].id;

    setTimeRecords((prev) => ({
      ...prev,
      [currentQId]: (prev[currentQId] || 0) + duration, // 累加 (因為可能來回切換)
    }));

    // 重置開始時間
    setQuestionStartTime(now);
  };

  useEffect(() => {
    if (!apiQuestions || apiQuestions.length === 0) return;

    const randomizedWithOpts = apiQuestions.map((q) => {
      const newQ = { ...q };
      if (q.type !== 'true-false' && q.type !== 'predict-line' && q.type !== 'fill-code') {
        if (newQ.options) newQ.options = shuffleArray(newQ.options);
      }
      return newQ;
    });

    setRandomizedQuestions(randomizedWithOpts);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setStartTime(Date.now());
    setShowResult(false);
    setResult(null);
    setTimeRecords({});
  }, [apiQuestions, retryCount]);

  const handleSelectQuestion = (index: number) => {
    updateTimeRecord();
    setCurrentQuestionIndex(index);
  };

  const handleNext = () => {
    if (currentQuestionIndex < randomizedQuestions.length - 1) {
      updateTimeRecord();
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      updateTimeRecord();
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

  const handleSubmit = async () => {
    if (!levelId) return;

    // 計算最後一題時間（不能等 setTimeRecords 更新，直接算）
    const now = Date.now();
    const lastQId = randomizedQuestions[currentQuestionIndex].id;
    const finalTimeRecords = {
      ...timeRecords,
      [lastQId]: (timeRecords[lastQId] || 0) + (now - questionStartTime),
    };

    const payload = randomizedQuestions.map((q) => ({
      question_id: q.backendId!,
      user_answer: userAnswers[q.id] ?? '',
      time_spent_seconds: Math.round((finalTimeRecords[q.id] || 0) / 1000),
    }));

    try {
      const resp = await tutorialService.submitPractice(levelId, payload);
      const answerResults: AnswerResult[] = resp.results.map((r: any) => {
        const q = randomizedQuestions.find((q) => q.backendId === r.question_id)!;
        return {
          questionId: q.id,
          isCorrect: r.is_correct,
          userAnswer: userAnswers[q.id] ?? '',
          correctAnswer: r.correct_answer ?? '',
          explanation: r.explanation ?? '',
          timeSpent: Math.round((finalTimeRecords[q.id] || 0) / 1000),
          points: r.points,
        };
      });

      const stars = PracticeService.calculateStars(resp.score);
      const calculatedResult: PracticeResult = {
        sessionId: `session-${Date.now()}`,
        levelId,
        totalQuestions: randomizedQuestions.length,
        correctCount: resp.correct_count,
        wrongCount: answerResults.filter(r => !r.isCorrect).length,
        score: resp.score,
        stars,
        timeSpent: Math.round((Date.now() - startTime) / 1000),
        isPassed: resp.score >= 60,
        answerResults,
        oldRating: currentUserRating,
        newRating: resp.new_rating,
        ratingDelta: resp.rating_delta,
      };

      setResult(calculatedResult);
      setShowResult(true);
    } catch (err) {
      console.error('[Practice] Submit failed:', err);
      toast.error('提交失敗，請檢查網路後再試');
    }
  };

  const handleRetry = () => {
    setTimeRecords({});
    setRetryCount((prev) => prev + 1);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  if (isLoadingQuestions) return <div className={styles.loading}>載入題目中...</div>;
  if (loadError) return <div className={styles.error}>{loadError}</div>;
  if (randomizedQuestions.length === 0) {
    if ((apiQuestions?.length ?? 0) > 0) return <div className={styles.loading}>載入題目中...</div>;
    return <div className={styles.error}>此關卡尚無題目</div>;
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
    { label: levelId ?? '', path: null },
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
                  <Button
                    key={q.id}
                    variant="ghost"
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
                  </Button>
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
              <li>正確率 60% 以上</li>
              <li>完成所有題目</li>
            </ul>
          </div>

          <Button
            variant="primary"
            className={styles.submitAllButton}
            onClick={handleSubmit}
            disabled={answeredCount < randomizedQuestions.length}
          >
            提交全部
          </Button>
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
                      autoHeight={true}
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
                        ? " (程式填空)"
                        : " (單選)"}
              </span>
            </h2>
          </div>

          <div className={styles.questionContent}>
            <p className={styles.questionText}>{currentQuestion.title}</p>

            {showCodeEditor && currentQuestion.code && (
              <div className={styles.codeBlock}>
                <CodeEditor
                  key={`editor-${currentQuestion.id}`}
                  mode="single"
                  language={currentQuestion.language || "python"}
                  value={currentQuestion.code}
                  readOnly={true}
                  theme="auto"
                  showLineNumbers={true}
                  autoHeight={true}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
            <Button
              variant="secondary"
              className={styles.navButton}
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
            >
              上一題
            </Button>
            <Button
              variant="primary"
              className={styles.navButton}
              onClick={isLastQuestion ? handleSubmit : handleNext}
              disabled={isLastQuestion ? !canSubmit : false}
            >
              {isLastQuestion ? "提交" : "下一題"}
            </Button>
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
