/**
 * Practice 相關類型定義
 * 用於練習測試系統
 */

// ==========================================
// 題目類型
// ==========================================

export interface Option {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
}

export interface Question {
  id: string;
  type: 'single-choice' | 'multiple-choice' | 'true-false';
  category: 'basic' | 'application' | 'complexity';
  difficulty: 1 | 2 | 3;
  title: string;
  options: Option[];
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
  status: 'in-progress' | 'completed' | 'abandoned';
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
}

export interface WrongQuestion {
  questionId: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  explanation: string;
}
