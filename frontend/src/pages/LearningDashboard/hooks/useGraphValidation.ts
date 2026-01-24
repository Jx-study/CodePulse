import { useMemo } from 'react';
import type { Level } from '@/types';
import { validateGraphAcyclic } from '../utils/graphUtils';

interface GraphValidationResult {
  isValid: boolean;
  cycle?: string[];
  error?: string;
}

/**
 * React Hook：驗證關卡依賴圖的有效性
 * 用於開發階段檢測循環依賴等圖結構問題
 */
export function useGraphValidation(levels: Level[]): GraphValidationResult {
  return useMemo(() => {
    const result = validateGraphAcyclic(levels);

    if (!result.isValid && result.cycle) {
      return {
        isValid: false,
        cycle: result.cycle,
        error: `Circular dependency detected: ${result.cycle.join(' → ')}`,
      };
    }

    return { isValid: true };
  }, [levels]);
}