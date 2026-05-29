import apiService from "@/api/api";
import type { VisualType, VisualData } from "@/types/practice";

export interface SessionResponse {
  success: boolean;
  session_id: number;
}

export interface TeachingCompleteResponse {
  success: boolean;
  xp_earned: number;
}

export interface ApiQuestion {
  question_id: number;
  stem: string;
  options: { id: string; text: string }[] | null;
  question_type: 'single-choice' | 'multiple-choice' | 'true-false' | 'predict-line' | 'fill-code';
  category: 'basic' | 'application' | 'complexity';
  code: string | null;
  language: string | null;
  group_id: number | null;
  group?: {
    title: string;
    description: string;
    code: string | null;
    language: string | null;
    visual_type: VisualType;
    visual_data: VisualData;
    visual_alt: string | null;
  } | null;
}

export interface QuestionsResponse {
  success: boolean;
  questions: ApiQuestion[];
}

export interface QuestionTranslationMap {
  stem: string;
  options: { id: string; text: string }[] | null;
  explanation: string | null;
}

export interface GroupTranslationMap {
  title: string;
  description: string | null;
  visual_alt: string | null;
}

export interface TranslationsResponse {
  success: boolean;
  questions: Record<string, QuestionTranslationMap>;
  groups: Record<string, GroupTranslationMap>;
}

export interface SubmitAnswerPayload {
  question_id: number;
  user_answer: string | string[];
  time_spent_seconds: number;
}

export interface SubmitResult {
  question_id: number;
  is_correct: boolean;
  correct_answer: string;
  explanation: string;
}

export interface SubmitResponse {
  success: boolean;
  score: number;
  correct_count: number;
  xp_earned: number;
  rating_delta: number;
  new_rating: number;
  results: SubmitResult[];
}

// API 函式
export const tutorialService = {
  async startSession(slug: string): Promise<number> {
    const res = await apiService.post<SessionResponse>(
      `/api/tutorials/${slug}/session`,
    );
    return res.data.session_id;
  },

  async endSession(slug: string, sessionId: number, durationSeconds: number): Promise<void> {
    await apiService.patch(
      `/api/tutorials/${slug}/session/${sessionId}`,
      { duration_seconds: durationSeconds },
    );
  },

  async markTeachingComplete(slug: string): Promise<TeachingCompleteResponse> {
    const res = await apiService.patch<TeachingCompleteResponse>(
      `/api/tutorials/${slug}/teaching-complete`,
    );
    return res.data;
  },

  async getQuestions(slug: string, lang = 'zh-TW'): Promise<ApiQuestion[]> {
    const res = await apiService.get<QuestionsResponse>(
      `/api/tutorials/${slug}/questions?lang=${lang}`,
    );
    return res.data.questions;
  },

  // 只取翻譯欄位（切語言時使用，不重新抽題）
  async getQuestionTranslations(
    slug: string,
    questionIds: number[],
    lang: string,
    signal?: AbortSignal,
  ): Promise<TranslationsResponse> {
    const ids = questionIds.join(',');
    const res = await apiService.get<TranslationsResponse>(
      `/api/tutorials/${slug}/questions/translations?lang=${lang}&ids=${ids}`,
      undefined,
      signal,
    );
    return res.data;
  },

  // 提交練習答案
  async submitPractice(slug: string, answers: SubmitAnswerPayload[], lang = 'zh-TW'): Promise<SubmitResponse> {
    const res = await apiService.post<SubmitResponse>(
      `/api/tutorials/${slug}/submit?lang=${lang}`,
      answers,
    );
    return res.data;
  },
};
