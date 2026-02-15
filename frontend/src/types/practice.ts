/**
 * Practice 相關類型定義
 * 用於練習測試系統
 */

// ==========================================
// 題目類型
// ==========================================

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type:
    | "single-choice"
    | "multiple-choice"
    | "true-false"
    | "predict-line"
    | "fill-code";
  category: "basic" | "application" | "complexity";
  difficulty: 1 | 2 | 3;
  difficultyRating?: number;
  title: string;
  options?: Option[];

  code?: string; // 程式碼內容
  language?: string; // 程式語言 (python, java, etc.)

  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface PracticeQuiz {
  levelId: string; // 'stack'
  levelName: string; // '堆疊 (Stack)'
  questions: Question[];
  passingScore: number;
  timeLimit?: number; // 時間限制（秒，可選）
}

export interface PracticeSession {
  sessionId: string;
  levelId: string;
  questions: Question[];
  userAnswers: Record<string, string | string[]>;
  startTime: number;
  endTime?: number;
  status: "in-progress" | "completed" | "abandoned";
  userStartRating: number;
}

export interface PracticeResult {
  sessionId: string;
  levelId: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  score: number;
  stars: 0 | 1 | 2 | 3;
  timeSpent: number;
  isPassed: boolean;
  wrongQuestions: WrongQuestion[];
  oldRating: number; // 測驗前分數
  newRating: number; // 測驗後分數
  ratingDelta: number; // 分數變化 (+15, -20)
}

export interface WrongQuestion {
  questionId: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  explanation: string;
}
