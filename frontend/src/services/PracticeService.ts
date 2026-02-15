/**
 * Practice Service - 練習測驗服務
 *
 * 職責：
 * - 驗證答案正確性
 * - 計算測驗分數和星級
 * - 生成測驗結果報告
 */

import { EloService } from "./EloService";
import type {
  Question,
  PracticeSession,
  PracticeResult,
  AnalysisReport,
} from "@/types/practice";

type ValidatorFn = (question: Question, userAnswer: any) => boolean;

const Validators: Record<string, ValidatorFn> = {
  "single-choice": (q, ans) => ans === q.correctAnswer,

  "multiple-choice": (q, ans) => {
    const correct = Array.isArray(q.correctAnswer)
      ? q.correctAnswer
      : [q.correctAnswer];
    const user = Array.isArray(ans) ? ans : [ans];
    if (correct.length !== user.length) return false;
    return correct.every((a) => user.includes(a));
  },

  "true-false": (q, ans) => ans === q.correctAnswer,

  // 預測行數 / 填充題驗證
  "predict-line": (q, ans) => {
    if (!ans || typeof ans !== "string") return false;

    // 正規化函式：將逗號替換為空格，去除多餘空格，轉為單一字串比較
    // 例如: "17, 18, 21" -> "17 18 21"
    const normalize = (str: string) =>
      str.replace(/,/g, " ").replace(/\s+/g, " ").trim();

    const correctStr = Array.isArray(q.correctAnswer)
      ? q.correctAnswer.join(" ")
      : q.correctAnswer;

    return normalize(ans) === normalize(correctStr);
  },

  "fill-code": (q, ans) => {
    // ans 應該是字串陣列 (使用者輸入的多個值)
    if (!Array.isArray(ans) || !Array.isArray(q.correctAnswer)) return false;

    if (ans.length !== q.correctAnswer.length) return false;

    // 正規化：去頭尾空白
    const normalize = (str: string) => (str || "").trim();

    // 每一格都要對才算對
    return q.correctAnswer.every((correctStr, index) => {
      return normalize(ans[index]) === normalize(correctStr);
    });
  },
};

export class PracticeService {
  /**
   * 驗證單個答案是否正確
   * @param question - 題目
   * @param userAnswer - 用戶答案
   * @returns 是否正確
   */
  static validateAnswer(
    question: Question,
    userAnswer: string | string[] | undefined,
  ): boolean {
    if (userAnswer === undefined || userAnswer === null || userAnswer === "") {
      return false;
    }

    // 根據題目類型找對應的驗證器
    const validator = Validators[question.type];

    if (validator) {
      return validator(question, userAnswer);
    }

    console.warn(`No validator found for type: ${question.type}`);
    return false;
  }

  static analyzePerformance(
    session: PracticeSession,
    wrongQuestions: any[],
    score: number,
  ): AnalysisReport {
    const { questions, timeRecords } = session;
    const suggestions: string[] = [];
    const weaknessTags: Set<string> = new Set();
    const behaviorTags: Set<string> = new Set();

    // 1. 分析錯誤題目的分類 (找出弱點)
    const wrongCategories = wrongQuestions
      .map((wq) => {
        const q = questions.find((item) => item.id === wq.questionId);
        return q?.category;
      })
      .filter(Boolean);

    // 計算每個分類的錯誤數
    const categoryCounts: Record<string, number> = {};
    wrongCategories.forEach((cat) => {
      if (!cat) return;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // 如果某個分類錯超過 3 題 (或佔比高)，視為弱點
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count >= 3) {
        // 門檻可調整
        if (cat === "basic") weaknessTags.add("基礎觀念");
        if (cat === "complexity") weaknessTags.add("時間複雜度");
        if (cat === "application") weaknessTags.add("實務應用");
      }
    });

    // 2. 分析作答時間 (找出行為模式)
    let rushErrors = 0;
    let hesitationErrors = 0;

    wrongQuestions.forEach((wq) => {
      const q = questions.find((item) => item.id === wq.questionId);
      const time = (timeRecords[wq.questionId] || 0) / 1000; // 秒

      // 粗心判定：難度低(1) 且 時間短(<5s)
      if (q?.difficulty === 1 && time < 5) {
        rushErrors++;
      }
      // 卡關判定：時間長(>60s) 且 錯
      if (time > 60) {
        hesitationErrors++;
      }
    });

    if (rushErrors > 0) {
      behaviorTags.add("粗心快手");
      suggestions.push(
        `你有 ${rushErrors} 題在 5 秒內作答但錯誤，建議放慢讀題速度。`,
      );
    }
    if (hesitationErrors > 0) {
      behaviorTags.add("思考卡關");
      suggestions.push(`部分題目思考時間較長，建議針對該知識點進行深度複習。`);
    }

    // 3. 生成整體評語
    let overallComment = "";
    if (score === 100) {
      overallComment = "完美無缺！你的觀念非常清晰。";
    } else if (weaknessTags.has("基礎觀念")) {
      overallComment = "基礎還不夠穩固，建議回頭複習基本定義。";
    } else if (weaknessTags.has("時間複雜度")) {
      overallComment = "邏輯正確，但對演算法效能分析較生疏。";
    } else if (rushErrors > 0) {
      overallComment = "觀念大致正確，但因作答過快而失分，太可惜了！";
    } else {
      overallComment = "表現不錯，針對錯題進行檢討即可更上一層樓。";
    }

    return {
      overallComment,
      weaknessTags: Array.from(weaknessTags),
      behaviorTags: Array.from(behaviorTags),
      suggestions,
    };
  }

  /**
   * 計算測驗結果
   * @param session - 練習會話
   * @returns 測驗結果
   */
  static calculateResult(session: PracticeSession): PracticeResult {
    const { questions, userAnswers, userStartRating, timeRecords } = session;

    let correctCount = 0;
    let currentRating = userStartRating || 1000; // 預設值
    const wrongQuestions: PracticeResult["wrongQuestions"] = [];

    questions.forEach((question) => {
      const userAnswer = userAnswers[question.id];
      const isCorrect = this.validateAnswer(question, userAnswer);

      // 1. 取得題目難度 (優先用 rating，沒有則用 difficulty 換算)
      const questionRating =
        question.difficultyRating ||
        EloService.difficultyToElo(question.difficulty);

      // 2. 計算這一題造成的 Elo 變化
      // 採用「逐題結算」的模擬方式，實際上也可以先算出總分再算 Elo
      // 但逐題算能讓每一題的難度都發揮作用
      const actualScore = isCorrect ? 1 : 0;
      currentRating = EloService.calculateNewRating(
        currentRating,
        questionRating,
        actualScore,
      );

      if (isCorrect) {
        correctCount++;
      } else {
        wrongQuestions.push({
          questionId: question.id,
          userAnswer: userAnswer || "",
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          timeSpent: Math.round((timeRecords[question.id] || 0) / 100) / 10,
        });
      }
    });

    const totalQuestions = questions.length;
    const wrongCount = totalQuestions - correctCount;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const ratingDelta = currentRating - (userStartRating || 1000);
    const stars = this.calculateStars(score);
    const timeSpent = session.endTime
      ? (session.endTime - session.startTime) / 1000
      : 0;
    const analysis = this.analyzePerformance(session, wrongQuestions, score);

    return {
      sessionId: session.sessionId,
      levelId: session.levelId,
      totalQuestions,
      correctCount,
      wrongCount,
      score,
      stars,
      timeSpent,
      isPassed: score >= 60,
      wrongQuestions,
      oldRating: userStartRating || 1000,
      newRating: currentRating,
      ratingDelta,
      analysis,
    };
  }

  /**
   * 根據分數計算星級
   * @param score - 分數 (0-100)
   * @returns 星級 (0-3)
   */
  static calculateStars(score: number): 0 | 1 | 2 | 3 {
    if (score >= 100) return 3;
    if (score >= 80) return 2;
    if (score >= 60) return 1;
    return 0;
  }

  /**
   * 檢查是否所有題目都已作答
   * @param questions - 題目列表
   * @param userAnswers - 用戶答案
   * @returns 是否全部作答
   */
  static isAllAnswered(
    questions: Question[],
    userAnswers: Record<string, string | string[]>,
  ): boolean {
    return questions.every((q) => {
      const answer = userAnswers[q.id];
      return answer !== undefined && answer !== null && answer !== "";
    });
  }

  /**
   * 獲取已作答題目數量
   * @param questions - 題目列表
   * @param userAnswers - 用戶答案
   * @returns 已作答數量
   */
  static getAnsweredCount(
    questions: Question[],
    userAnswers: Record<string, string | string[]>,
  ): number {
    return questions.filter((q) => {
      const answer = userAnswers[q.id];
      return answer !== undefined && answer !== null && answer !== "";
    }).length;
  }

  /**
   * 生成評級文本
   * @param stars - 星級
   * @returns 評級文本
   */
  static getGradeText(stars: 0 | 1 | 2 | 3): string {
    switch (stars) {
      case 3:
        return "完美！";
      case 2:
        return "優秀！";
      case 1:
        return "及格！";
      default:
        return "需要加強";
    }
  }

  /**
   * 生成鼓勵文本
   * @param result - 測驗結果
   * @returns 鼓勵文本
   */
  static getEncouragementText(result: PracticeResult): string {
    if (result.stars === 3) {
      return "太棒了！你完全掌握了這個主題！";
    } else if (result.stars === 2) {
      return "做得很好！再接再厲！";
    } else if (result.stars === 1) {
      return "不錯的開始！繼續努力！";
    } else {
      return "別氣餒！再試一次，你一定可以的！";
    }
  }
}
