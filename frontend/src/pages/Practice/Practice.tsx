import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { xp } from "@/shared/components/XpFloat";
import styles from "./Practice.module.scss";
import { shuffleArray, getOptionLabel } from "@/utils/random";
import { safeImageUrl } from "@/utils/visualGuard";
import { renderInlineText } from "@/utils/renderInlineText";
const CodeEditor = lazy(() => import("@/modules/core/components/CodeEditor/CodeEditor"));
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
    visual_type: q.visual_type,
    visual_data: q.visual_data,
    visual_alt: q.visual_alt,
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
  const { t, i18n } = useTranslation('practice');
  const currentUserRating = user?.skill_rating ?? DEFAULT_RATING;

  // 從後端載入題目
  const [apiQuestions, setApiQuestions] = useState<Question[] | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!levelId) return;
    setIsLoadingQuestions(true);
    tutorialService.getQuestions(levelId, i18n.language)
      .then((apiQs) => {
        setApiQuestions(mapApiQuestionsToLocal(apiQs));
      })
      .catch(() => setLoadError('error'))
      .finally(() => setIsLoadingQuestions(false));
  }, [levelId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 切語言時只更新翻譯欄位，不重置答題狀態
  useEffect(() => {
    if (!levelId || randomizedQuestions.length === 0) return;

    // 在 fetch 前先快照，避免 async resolve 後讀到 stale closure
    const questionIds = randomizedQuestions.map((q) => q.backendId!);
    const qIdMap = new Map(randomizedQuestions.map((q) => [q.id, q.backendId]));
    const isShowingResult = showResult;

    tutorialService.getQuestionTranslations(levelId, questionIds, i18n.language)
      .then((data) => {
        setRandomizedQuestions((prev) =>
          prev.map((q) => {
            const qt = data.questions[String(q.backendId)];
            if (!qt) return q;
            const updated: Question = {
              ...q,
              title: qt.stem,
              options: qt.options ?? q.options,
              visual_alt: qt.visual_alt ?? q.visual_alt,
            };
            if (q.groupId) {
              const gt = data.groups[q.groupId];
              if (gt) {
                updated.group = {
                  ...q.group!,
                  title: gt.title,
                  description: gt.description ?? undefined,
                  visual_alt: gt.visual_alt,
                };
              }
            }
            return updated;
          })
        );

        if (isShowingResult) {
          setResult((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              answerResults: prev.answerResults.map((ar) => {
                const backendId = qIdMap.get(ar.questionId);
                if (!backendId) return ar;
                const qt = data.questions[String(backendId)];
                if (!qt) return ar;
                return { ...ar, explanation: qt.explanation ?? ar.explanation };
              }),
            };
          });
        }
      })
      .catch(() => {
        // 翻譯更新失敗時靜默忽略，保留舊語言文字
      });
  }, [i18n.language]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const [activeVisual, setActiveVisual] = useState<'group' | 'question'>('group');
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
    setActiveVisual('group');
  }, [apiQuestions, retryCount]);

  const handleSelectQuestion = (index: number) => {
    updateTimeRecord();
    setCurrentQuestionIndex(index);
    setActiveVisual('group');
  };

  const handleNext = () => {
    if (currentQuestionIndex < randomizedQuestions.length - 1) {
      updateTimeRecord();
      setCurrentQuestionIndex((prev) => prev + 1);
      setActiveVisual('group');
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      updateTimeRecord();
      setCurrentQuestionIndex((prev) => prev - 1);
      setActiveVisual('group');
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
      const resp = await tutorialService.submitPractice(levelId, payload, i18n.language);
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
        xpEarned: resp.xp_earned ?? 0,
      };

      setResult(calculatedResult);
      setShowResult(true);
      if ((resp.xp_earned ?? 0) > 0) {
        xp.show(resp.xp_earned ?? 0, { reason: 'practice' });
      }
    } catch (err) {
      console.error('[Practice] Submit failed:', err);
      toast.error(t('submitError'));
    }
  };

  const handleRetry = () => {
    setTimeRecords({});
    setRetryCount((prev) => prev + 1);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  if (isLoadingQuestions) return <div className={styles.loading}>{t('loading')}</div>;
  if (loadError) return <div className={styles.error}>{t('loadError')}</div>;
  if (randomizedQuestions.length === 0) {
    if ((apiQuestions?.length ?? 0) > 0) return <div className={styles.loading}>{t('loading')}</div>;
    return <div className={styles.error}>{t('noQuestions')}</div>;
  }

  const currentQuestion = randomizedQuestions[currentQuestionIndex];
  const currentGroup = getCurrentGroup(currentQuestion);

  const groupVisualUrl = currentGroup?.visual_type === 'image'
    ? safeImageUrl(currentGroup.visual_data)
    : null;
  const questionVisualUrl = currentQuestion.visual_type === 'image'
    ? safeImageUrl(currentQuestion.visual_data ?? null)
    : null;
  const showVisualToggle = Boolean(groupVisualUrl && questionVisualUrl);
  const visualToShow = showVisualToggle
    ? activeVisual
    : questionVisualUrl
      ? 'question'
      : groupVisualUrl
        ? 'group'
        : null;

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
      label: category === "data-structures"
        ? t('breadcrumb.dataStructures')
        : category || t('breadcrumb.unknownCategory'),
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
            <h3 className={styles.sidebarTitle}>{t('sidebar.questionList')}</h3>
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
                    {t('sidebar.questionNumber', { number: index + 1 })}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>{t('sidebar.progress')}</h3>
            <p>{t('sidebar.answeredCount', { answered: answeredCount, total: randomizedQuestions.length })}</p>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>{t('sidebar.passingCondition')}</h3>
            <ul className={styles.requirementList}>
              <li>{t('sidebar.passingScore', { score: 60 })}</li>
              <li>{t('sidebar.completeAll')}</li>
            </ul>
          </div>

          <Button
            variant="primary"
            className={styles.submitAllButton}
            onClick={handleSubmit}
            disabled={answeredCount < randomizedQuestions.length}
          >
            {t('sidebar.submitAll')}
          </Button>
        </div>

        <div className={styles.workspace}>
          {currentGroup && (
            <div className={styles.groupContextContainer}>
              <div className={styles.groupHeader}>
                <span className={styles.groupBadge}>{t('question.groupBadge')}</span>
                <h3 className={styles.groupTitle}>{currentGroup.title}</h3>
              </div>

              <div className={styles.groupContent}>
                <p className={styles.groupDesc}>
                  {renderInlineText(currentGroup.description ?? "")}
                </p>
                {currentGroup.code && (
                  <div className={styles.groupCodeBlock}>
                    <Suspense fallback={null}>
                      <CodeEditor
                        mode="single"
                        language={currentGroup.language || "python"}
                        value={currentGroup.code}
                        readOnly={true}
                        theme="auto"
                        showLineNumbers={true}
                        autoHeight={true}
                      />
                    </Suspense>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className={styles.questionHeader}>
            <h2 className={styles.questionTitle}>
              {t('question.of', { current: currentQuestionIndex + 1, total: randomizedQuestions.length })}
              <span className={styles.typeBadge}>
                {` (${t(`question.types.${currentQuestion.type}`)})`}
              </span>
            </h2>
          </div>

          {visualToShow && (
            <div className={styles.visualSection}>
              {showVisualToggle && (
                <div className={styles.visualToggle}>
                  <Button
                    variant={activeVisual === 'group' ? 'primaryOutline' : 'ghost'}
                    size="sm"
                    className={activeVisual !== 'group' ? styles.visualToggleBtnInactive : ''}
                    aria-pressed={activeVisual === 'group'}
                    onClick={() => setActiveVisual('group')}
                  >
                    {t('visual.groupImage')}
                  </Button>
                  <Button
                    variant={activeVisual === 'question' ? 'primaryOutline' : 'ghost'}
                    size="sm"
                    className={activeVisual !== 'question' ? styles.visualToggleBtnInactive : ''}
                    aria-pressed={activeVisual === 'question'}
                    onClick={() => setActiveVisual('question')}
                  >
                    {t('visual.hintImage')}
                  </Button>
                </div>
              )}
              {visualToShow === 'group' && groupVisualUrl && currentGroup && (
                <figure className={styles.groupVisual}>
                  <img
                    src={groupVisualUrl}
                    alt={currentGroup.visual_alt ?? currentGroup.title}
                    loading="lazy"
                    className={styles.groupVisualImage}
                  />
                </figure>
              )}
              {visualToShow === 'question' && questionVisualUrl && (
                <figure className={styles.groupVisual}>
                  <img
                    src={questionVisualUrl}
                    alt={currentQuestion.visual_alt ?? currentQuestion.title}
                    loading="lazy"
                    className={styles.groupVisualImage}
                  />
                </figure>
              )}
            </div>
          )}

          <div className={styles.questionContent}>
            <p className={styles.questionText}>
              {renderInlineText(currentQuestion.title)}
            </p>

            {showCodeEditor && currentQuestion.code && (
              <div className={styles.codeBlock}>
                <Suspense fallback={null}>
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
                </Suspense>
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
                  {t('question.predictLineHint')}
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
                  placeholder={t('question.predictLinePlaceholder')}
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
                  {t('question.fillCodeHint')}
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
                        placeholder={t('question.fillCodePlaceholder', { id: opt.id })}
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
                        ({getOptionLabel(index)}) {renderInlineText(option.text)}
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
              {t('question.prev')}
            </Button>
            <Button
              variant="primary"
              className={styles.navButton}
              onClick={isLastQuestion ? handleSubmit : handleNext}
              disabled={isLastQuestion ? !canSubmit : false}
            >
              {isLastQuestion ? t('question.submit') : t('question.next')}
            </Button>
          </div>
        </div>
      </div>

      {showResult && result && (
        <>
          <ResultModal
            isOpen={showResult}
            result={result}
            questions={randomizedQuestions}
            onRetry={handleRetry}
            onBackToDashboard={handleBackToDashboard}
          />
        </>
      )}
    </div>
  );
}

export default Practice;
