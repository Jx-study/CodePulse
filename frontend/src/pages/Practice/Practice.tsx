import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { PracticeResult, PracticeSession } from '@/types/practice';
import { getQuizByLevelId } from '@/data/questions';
import { PracticeService } from '@/services/PracticeService';
import Breadcrumb from '@/shared/components/Breadcrumb';
import { ResultModal } from './components/ResultModal';
import type { BreadcrumbItem } from '@/types';
import styles from './Practice.module.scss';

function Practice() {
  const { category, levelId } = useParams<{
    category: string;
    levelId: string;
  }>();
  const navigate = useNavigate();

  const quiz = useMemo(() => {
    if (!levelId) return null;
    return getQuizByLevelId(levelId);
  }, [levelId]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [startTime, setStartTime] = useState(Date.now());

  const handleSelectQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = () => {
    if (!quiz) return;

    const session: PracticeSession = {
      sessionId: `session-${Date.now()}`,
      levelId: quiz.levelId,
      questions: quiz.questions,
      userAnswers,
      startTime,
      endTime: Date.now(),
      status: 'completed',
    };

    const calculatedResult = PracticeService.calculateResult(session);
    setResult(calculatedResult);
    setShowResult(true);
  };

  const handleRetry = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setResult(null);
    setStartTime(Date.now());
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (!quiz) {
    return (
      <div className={styles.practicePage}>
        <div className={styles.errorContainer}>
          <h2 className={styles.errorTitle}>找不到題庫</h2>
          <p className={styles.errorMessage}>
            抱歉，無法找到「{levelId}」的練習題庫。請返回 Dashboard 選擇其他關卡。
          </p>
          <button className={styles.errorButton} onClick={handleBackToDashboard}>
            返回 Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;

  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: category === 'data-structures' ? '數據結構' : category || '未知分類',
      path: `/dashboard?category=${category}`,
    },
    { label: quiz.levelName, path: null },
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
              {quiz.questions.map((q, index) => (
                <button
                  key={q.id}
                  className={`${styles.questionItem} ${
                    index === currentQuestionIndex ? styles.active : ''
                  } ${userAnswers[q.id] ? styles.answered : ''}`}
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
              已答題: {answeredCount} / {quiz.questions.length}
            </p>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>通關條件</h3>
            <ul className={styles.requirementList}>
              <li>正確率 {quiz.passingScore}% 以上</li>
              <li>完成所有題目</li>
            </ul>
          </div>

          <button
            className={styles.submitAllButton}
            onClick={handleSubmit}
            disabled={answeredCount < quiz.questions.length}
          >
            提交全部
          </button>
        </div>

        <div className={styles.workspace}>
          <div className={styles.questionHeader}>
            <h2 className={styles.questionTitle}>
              題目 {currentQuestionIndex + 1} of {quiz.questions.length}
            </h2>
          </div>

          <div className={styles.questionContent}>
            <p className={styles.questionText}>{currentQuestion.title}</p>

            <div className={styles.optionList}>
              {currentQuestion.options.map((option) => (
                <label
                  key={option.id}
                  className={`${styles.optionItem} ${
                    userAnswers[currentQuestion.id] === option.id ? styles.selected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option.id}
                    checked={userAnswers[currentQuestion.id] === option.id}
                    onChange={() => handleAnswerChange(currentQuestion.id, option.id)}
                    className={styles.optionInput}
                  />
                  <span className={styles.optionLabel}>
                    ({option.id}) {option.text}
                  </span>
                </label>
              ))}
            </div>
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
              disabled={currentQuestionIndex === quiz.questions.length - 1}
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
          questions={quiz.questions}
          onRetry={handleRetry}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </div>
  );
}

export default Practice;
