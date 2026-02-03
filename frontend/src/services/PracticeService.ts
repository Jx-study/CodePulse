/**
 * Practice Service - 練習測驗服務
 *
 * 職責：
 * - 驗證答案正確性
 * - 計算測驗分數和星級
 * - 生成測驗結果報告
 */

import type { Question, PracticeSession, PracticeResult } from '@/types/practice';

export class PracticeService {
  /**
   * 驗證單個答案是否正確
   * @param question - 題目
   * @param userAnswer - 用戶答案
   * @returns 是否正確
   */
  static validateAnswer(
    question: Question,
    userAnswer: string | string[] | undefined
  ): boolean {
    if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
      return false;
    }

    if (question.type === 'single-choice') {
      return userAnswer === question.correctAnswer;
    } else if (question.type === 'multiple-choice') {
      const correct = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];
      const user = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

      if (correct.length !== user.length) return false;

      return correct.every((ans) => user.includes(ans));
    } else if (question.type === 'true-false') {
      return userAnswer === question.correctAnswer;
    }

    return false;
  }

  /**
   * 計算測驗結果
   * @param session - 練習會話
   * @returns 測驗結果
   */
  static calculateResult(session: PracticeSession): PracticeResult {
    const { questions, userAnswers } = session;
    let correctCount = 0;
    const wrongQuestions: PracticeResult['wrongQuestions'] = [];

    questions.forEach((question) => {
      const userAnswer = userAnswers[question.id];
      const isCorrect = this.validateAnswer(question, userAnswer);

      if (isCorrect) {
        correctCount++;
      } else {
        wrongQuestions.push({
          questionId: question.id,
          userAnswer: userAnswer || '',
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
        });
      }
    });

    const totalQuestions = questions.length;
    const wrongCount = totalQuestions - correctCount;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const stars = this.calculateStars(score);
    const timeSpent = session.endTime
      ? (session.endTime - session.startTime) / 1000
      : 0;

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
    userAnswers: Record<string, string | string[]>
  ): boolean {
    return questions.every((q) => {
      const answer = userAnswers[q.id];
      return answer !== undefined && answer !== null && answer !== '';
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
    userAnswers: Record<string, string | string[]>
  ): number {
    return questions.filter((q) => {
      const answer = userAnswers[q.id];
      return answer !== undefined && answer !== null && answer !== '';
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
        return '完美！';
      case 2:
        return '優秀！';
      case 1:
        return '及格！';
      default:
        return '需要加強';
    }
  }

  /**
   * 生成鼓勵文本
   * @param result - 測驗結果
   * @returns 鼓勵文本
   */
  static getEncouragementText(result: PracticeResult): string {
    if (result.stars === 3) {
      return '太棒了！你完全掌握了這個主題！🎉';
    } else if (result.stars === 2) {
      return '做得很好！再接再厲！💪';
    } else if (result.stars === 1) {
      return '不錯的開始！繼續努力！📚';
    } else {
      return '別氣餒！再試一次，你一定可以的！💡';
    }
  }
}
