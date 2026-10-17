import { LinearData } from '@/data/DataStructure/linear/utils';
import { cloneData } from '@/modules/core/visualization/visualizationUtils';
import { DATA_LIMITS } from '@/constants/dataLimits';
import type { ActionContext, ActionResult } from '@/modules/core/visualization/types';
import i18n from '@/i18n';

interface LinearActionHandlerOptions {
  randomValueRange?: [number, number];
  sortOnLoad?: boolean;
  sortNoticeNamespace?: string;
}

export function createLinearActionHandler(options: LinearActionHandlerOptions = {}) {
  const { randomValueRange = [-20, 80], sortOnLoad = false, sortNoticeNamespace } = options;
  const [min, max] = randomValueRange;

  return function (
    actionType: string,
    payload: Record<string, unknown>,
    data: LinearData[],
    context: ActionContext,
  ): ActionResult<LinearData[]> | null {
    if (actionType === 'random') {
      const count = (payload.randomCount as number) ?? DATA_LIMITS.DEFAULT_RANDOM_COUNT;
      let values = Array.from({ length: count }, () =>
        Math.floor(Math.random() * (max - min)) + min
      );
      if (sortOnLoad) values = values.sort((a, b) => a - b);
      return {
        animationData: values.map((v) => ({ id: context.nextId(), value: v })),
        isResetAction: true,
      };
    }

    if (actionType === 'load') {
      const values = payload.data as number[];
      if (!values?.length) return null;
      const sorted = sortOnLoad ? [...values].sort((a, b) => a - b) : values;
      if (sortOnLoad && sortNoticeNamespace && sorted.some((v, i) => v !== values[i])) {
        context.toast.info(i18n.t('actionHandler.autoSorted', { ns: sortNoticeNamespace }));
      }
      return {
        animationData: sorted.map((v) => ({ id: context.nextId(), value: v })),
        isResetAction: true,
      };
    }

    if (actionType === 'reset') {
      const defaultData = (context.defaultData as LinearData[]) ?? data;
      return { animationData: cloneData(defaultData), isResetAction: true };
    }

    if (actionType === 'run') {
      return { animationData: cloneData(data) };
    }

    return null;
  };
}
