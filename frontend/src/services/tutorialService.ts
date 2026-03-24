export interface ApiTutorialProgress {
  tutorial_slug: string;
  teaching_completed: boolean;
  best_score: number | null;
  best_time_seconds: number | null;
  attempt_count: number;
  practice_passed: boolean;
  status: 'not_started' | 'teaching_in_progress' | 'teaching_done' | 'practice_in_progress' | 'completed';
  last_accessed_at: string | null;
}

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
  points: number;
  code: string | null;
  language: string | null;
  group_id: number | null;
  group?: {
    title: string;
    description: string;
    code: string | null;
    language: string | null;
  };
}

export interface QuestionsResponse {
  success: boolean;
  questions: ApiQuestion[];
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

// ── API 函式 ──────────────────────────────────────────────

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const doFetch = () => fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let resp = await doFetch();

  // Access token 過期時，先呼叫 /api/auth/status 讓它自動換新 token，再重試一次
  if (resp.status === 401) {
    try {
      await fetch('/api/auth/status', { credentials: 'include' });
      resp = await doFetch();
    } catch {
      // refresh 失敗，維持原本的 401
    }
  }

  const data = await resp.json();
  if (!resp.ok) throw new Error(data.message || 'API error');
  return data as T;
}

export const tutorialService = {
  // 取得當前用戶所有 tutorial 進度
  async getMyProgress(): Promise<ApiTutorialProgress[]> {
    const data = await fetchJson<{ success: boolean; progress: ApiTutorialProgress[] }>(
      '/api/users/me/progress'
    );
    return data.progress;
  },

  // 進入教學頁面時建立 session
  async startSession(slug: string): Promise<number> {
    const data = await fetchJson<SessionResponse>(
      `/api/tutorials/${slug}/session`,
      { method: 'POST' }
    );
    return data.session_id;
  },

  // 離開頁面時更新 session 結束時間
  async endSession(slug: string, sessionId: number, durationSeconds: number): Promise<void> {
    await fetchJson(
      `/api/tutorials/${slug}/session/${sessionId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ duration_seconds: durationSeconds }),
      }
    );
  },

  // 標記教學完成（停留 >= 30 秒後才能呼叫）
  async markTeachingComplete(slug: string): Promise<TeachingCompleteResponse> {
    return fetchJson<TeachingCompleteResponse>(
      `/api/tutorials/${slug}/teaching-complete`,
      { method: 'PATCH' }
    );
  },

  // 取得題目列表（不含正確答案）
  async getQuestions(slug: string, lang = 'zh-TW'): Promise<ApiQuestion[]> {
    const data = await fetchJson<QuestionsResponse>(
      `/api/tutorials/${slug}/questions?lang=${lang}`
    );
    return data.questions;
  },

  // 提交練習答案
  async submitPractice(slug: string, answers: SubmitAnswerPayload[]): Promise<SubmitResponse> {
    return fetchJson<SubmitResponse>(
      `/api/tutorials/${slug}/submit`,
      {
        method: 'POST',
        body: JSON.stringify(answers),
      }
    );
  },
};
