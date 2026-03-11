import type { Question } from "@/types/practice";

/**
 * Fisher-Yates 洗牌算法
 * @param array 原始陣列
 * @returns 洗牌後的新陣列
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

/**
 * 題組隨機化邏輯
 * 保持同一 groupId 的題目相鄰，且維持題組內原本的順序 (子題 1 -> 子題 2)
 */
export function shuffleQuestionsWithGroups(questions: Question[]): Question[] {
  // 1. 定義洗牌單元 (可以是單題，也可以是整組題目)
  type ShuffleUnit =
    | { type: "single"; questions: Question[] }
    | { type: "group"; id: string; questions: Question[] };

  const units: ShuffleUnit[] = [];
  const processedGroups = new Set<string>();

  // 2. 遍歷題目進行分組打包
  questions.forEach((q) => {
    if (q.groupId) {
      if (processedGroups.has(q.groupId)) return; // 已處理過該組，跳過

      // 找出該組所有題目，並保持原始順序
      const groupQuestions = questions.filter(
        (item) => item.groupId === q.groupId,
      );
      units.push({ type: "group", id: q.groupId, questions: groupQuestions });
      processedGroups.add(q.groupId);
    } else {
      // 單題自己一包
      units.push({ type: "single", questions: [q] });
    }
  });

  // 3. 對單元進行洗牌
  const shuffledUnits = shuffleArray(units);

  // 4. 解包 (Flatten) 回題目陣列
  return shuffledUnits.flatMap((unit) => unit.questions);
}

/**
 * 獲取選項的顯示標籤 (0 -> A, 1 -> B, ...)
 */
export function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}
