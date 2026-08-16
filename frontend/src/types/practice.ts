/**
 * Practice 相關類型定義
 * 用於練習測試系統
 */

// ==========================================
// 視覺類型
// ==========================================

export type VisualType = "none" | "image";

export interface ImageVisualData {
  url: string;
}

export type VisualData = ImageVisualData | null;

// ==========================================
// 題目類型
// ==========================================

interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  backendId?: number; // 從後端載入時帶入，submit 時使用
  type:
    | "single-choice"
    | "multiple-choice"
    | "true-false"
    | "predict-line"
    | "fill-code";
  category: "basic" | "application" | "complexity";
  title: string;
  options?: Option[];

  code?: string; // 程式碼內容
  language?: string; // 程式語言 (python, java, etc.)

  visual_type?: VisualType;
  visual_data?: VisualData;
  visual_alt?: string | null;

  correctAnswer: string | string[] | (string | string[])[];
  explanation: string;
  groupId?: string;
  group?: {
    title: string;
    description?: string;
    code: string | null;
    language: string | null;
    visual_type: VisualType;
    visual_data: VisualData;
    visual_alt: string | null;
  } | null;
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
  answerResults: AnswerResult[];
  oldRating: number; // 測驗前分數
  newRating: number; // 測驗後分數
  ratingDelta: number; // 分數變化 (+15, -20)
  xpEarned: number;
}

export interface AnswerResult {
  questionId: string;
  isCorrect: boolean;
  userAnswer: string | string[];
  correctAnswer: string | string[] | (string | string[])[];
  explanation: string;
  timeSpent: number;
  points: number;
}

