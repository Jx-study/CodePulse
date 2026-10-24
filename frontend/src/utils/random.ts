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
 * 獲取選項的顯示標籤 (0 -> A, 1 -> B, ...)
 */
export function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}
