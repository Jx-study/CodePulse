/**
 * 統一的視覺化邏輯 Hook
 * 合併 useDataStructureLogic 與 useAlgorithmLogic
 * Strategy 模式：config.actionHandler 薄殼委派
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "@/shared/components/Toast";
import {
  cloneData,
} from "@/modules/core/visualization/visualizationUtils";
import type { LevelImplementationConfig } from "@/types/implementation";

const noop = () => {};

export const useVisualizationLogic = (config: LevelImplementationConfig | null) => {
  const [data, setData] = useState<any>(config?.defaultData ?? []);
  const [activeSteps, setActiveSteps] = useState<any[]>([]);
  const nextIdRef = useRef(100);

  const createSteps = (inputData: any, actionParams?: any, extra?: any) => {
    if (config?.createAnimationSteps) {
      return config.createAnimationSteps(inputData, actionParams, extra);
    }
    return [];
  };

  // 初始化
  useEffect(() => {
    if (!config) {
      setData([]);
      setActiveSteps([]);
      return;
    }

    if (config.type === "algorithm") {
      // 演算法初始化
      if (!config.defaultData) return;
      let initialData: any;
      let initParams: any = {};

      if (Array.isArray(config.defaultData)) {
        const isObjectArray = typeof config.defaultData[0] === "object";
        if (isObjectArray) {
          initialData = cloneData(config.defaultData);
        } else {
          initialData = config.defaultData.map((d: any) => ({
            ...d,
            id: d.id || `box-${nextIdRef.current++}`,
          }));
        }
        if (config.id === "slidingwindow") {
          initParams = { mode: "longest_lte", targetSum: 20 };
        }
      } else {
        if (config.defaultData.graph) {
          initialData = cloneData(config.defaultData.graph);
          initParams = { mode: "graph" };
        } else {
          initialData = cloneData(config.defaultData);
          initParams = { mode: "graph" };
        }
      }

      const steps = createSteps(initialData, initParams);
      setData(initialData);
      setActiveSteps(steps);
    } else {
      // 資料結構初始化
      const initData = cloneData(config.defaultData || []);
      setData(initData);
      if (config.createAnimationSteps) {
        const initParams = config.id === "graph" ? { mode: "graph" } : undefined;
        const initSteps = config.createAnimationSteps(initData, initParams, false);
        setActiveSteps(initSteps);
      }
    }
  }, [config]);

  const executeAction = useCallback(
    (actionType: string, payload: any): any[] => {
      if (!config) return [];
      if (config.actionHandler) {
        const result = config.actionHandler(
          actionType,
          payload ?? {},
          cloneData(data),
          {
            nextId: () => `node-${nextIdRef.current++}`,
            toast: { warning: toast.warning },
            defaultData: config.defaultData,
          },
        );
        if (!result || result.animationData === undefined) return [];

        const animData = result.animationData;
        const stateData = result.stateData ?? result.animationData;

        let animationParams: any;
        if (result.useRawAnimationParams) {
          animationParams = result.animationParams;
        } else if (result.isResetAction) {
          animationParams = undefined;
        } else {
          animationParams = {
            type: actionType,
            ...(payload ?? {}),
            ...((result.animationParams as object) ?? {}),
          };
        }

        const steps = config.createAnimationSteps(
          animData,
          animationParams,
          payload?.hasTailMode,
        );

        setData(stateData);
        setActiveSteps(steps);
        return steps;
      }

      return [];
    },
    [config, data],
  );

  if (!config) {
    return {
      data: [],
      activeSteps: [],
      executeAction: () => [],
      setData: noop,
    };
  }

  return {
    data,
    activeSteps,
    executeAction,
    setData,
  };
};
