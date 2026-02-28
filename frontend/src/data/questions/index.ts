/**
 * 題庫註冊表
 * 用於管理所有數據結構的練習題庫
 */

import type { PracticeQuiz } from '@/types/practice';
import { stackQuiz } from './stack-questions';
import { queueQuiz } from './queue-questions';
import { arrayQuiz } from './array-questions';
import { linkedListQuiz } from './linkedlist-questions';
import { binaryTreeQuiz } from './binarytree-questions';
import { binarySearchTreeQuiz } from './bst-questions';
import { graphQuiz } from './graph-questions';
import { binarySearchQuiz } from './binarysearch-questions';

export const quizMap: Record<string, PracticeQuiz> = {
  stack: stackQuiz,
  queue: queueQuiz,
  array: arrayQuiz,
  'linked-list': linkedListQuiz,
  binarytree: binaryTreeQuiz,
  bst: binarySearchTreeQuiz,
  graph: graphQuiz,
  'binary-search': binarySearchQuiz,
  // TODO: 後續擴展其他題庫
};

/**
 * 根據 levelId 獲取對應的題庫
 * @param levelId - 關卡 ID (如 'stack')
 * @returns 題庫配置，如果不存在則返回 null
 */
export function getQuizByLevelId(levelId: string): PracticeQuiz | null {
  return quizMap[levelId] || null;
}

export function getAllQuizzes(): PracticeQuiz[] {
  return Object.values(quizMap);
}

/**
 * 檢查某個 levelId 是否有對應的題庫
 * @param levelId - 關卡 ID
 * @returns 是否存在題庫
 */
export function hasQuiz(levelId: string): boolean {
  return levelId in quizMap;
}
