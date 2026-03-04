import { LineComplexity } from './types';

/**
 * 基礎 Python 時間複雜度分析器
 * 透過偵測迴圈關鍵字與縮排深度來估算每一行的複雜度
 */
export function analyzeTimeComplexity(code: string): LineComplexity[] {
  const lines = code.split('\n');
  const results: LineComplexity[] = [];
  
  // 追蹤目前的迴圈深度
  let currentLoopDepth = 0;
  const indentStack: number[] = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const lineNumber = index + 1;

    // 忽略空行與註解
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    // 計算目前的縮排
    const indent = line.search(/\S/);
    
    // 如果縮排減少，彈出 stack 並減少深度
    while (indentStack.length > 0 && indent <= indentStack[indentStack.length - 1]) {
      indentStack.pop();
      currentLoopDepth = Math.max(0, currentLoopDepth - 1);
    }

    // 偵測是否為迴圈起始行
    const isLoop = /^\s*(for|while)\b/.test(line);
    
    if (isLoop) {
      // 迴圈行的複雜度顯示目前的深度 + 1 (代表這個迴圈本身的複雜度)
      const complexity = currentLoopDepth === 0 ? 'O(n)' : `O(n^${currentLoopDepth + 1})`;
      results.push({ lineNumber, complexity });
      
      // 進入新迴圈，記錄縮排並增加深度
      indentStack.push(indent);
      currentLoopDepth++;
    } else if (currentLoopDepth > 0) {
      // 迴圈內部的程式碼
      const complexity = currentLoopDepth === 1 ? 'O(n)' : `O(n^${currentLoopDepth})`;
      results.push({ lineNumber, complexity });
    } else {
      // 一般程式碼
      results.push({ lineNumber, complexity: 'O(1)' });
    }
  });

  return results;
}
