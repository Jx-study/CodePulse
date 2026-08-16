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
import type { AnimationStep } from "@/types";

const noop = () => {};

export const useVisualizationLogic = (config: LevelImplementationConfig | null) => {
  // `data`'s shape is heterogeneous across the ~30 registered DS/algorithm
  // modules (see LevelImplementationConfig's own `any`s in types/implementation.ts) —
  // this hook is the same erasure boundary, so `data` stays loosely typed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(config?.defaultData ?? []);
  const [activeSteps, setActiveSteps] = useState<AnimationStep[]>([]);
  const nextIdRef = useRef(100);

  const createSteps = (
    inputData: unknown,
    actionParams?: unknown,
    extra?: unknown,
  ) => {
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
      let initialData: unknown;
      let initParams: Record<string, unknown> = {};

      if (Array.isArray(config.defaultData)) {
        const isObjectArray = typeof config.defaultData[0] === "object";
        if (isObjectArray) {
          initialData = cloneData(config.defaultData);
        } else {
          initialData = (config.defaultData as unknown[]).map((d) => {
            const id = (d as Record<string, unknown> | undefined)?.id;
            return {
              ...(d as object),
              id: id || `box-${nextIdRef.current++}`,
            };
          });
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
        const initSteps = config.createAnimationSteps(initData, initParams, {
          hasTailMode: false,
          isDoubly: false,
        });
        setActiveSteps(initSteps);
      }
    }
  }, [config]);

  const executeAction = useCallback(
    (actionType: string, payload: unknown): AnimationStep[] => {
      if (!config) return [];
      if (config.actionHandler) {
        const payloadRecord = (payload ?? {}) as Record<string, unknown>;
        const result = config.actionHandler(
          actionType,
          payloadRecord,
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

        let animationParams: Record<string, unknown> | undefined;
        if (result.useRawAnimationParams) {
          animationParams = result.animationParams as
            | Record<string, unknown>
            | undefined;
        } else if (result.isResetAction) {
          animationParams = undefined;
        } else {
          animationParams = {
            type: actionType,
            ...payloadRecord,
            ...((result.animationParams as object) ?? {}),
          };
        }

        const steps = config.createAnimationSteps(animData, animationParams, {
          hasTailMode:
            animationParams?.hasTailMode ?? payloadRecord?.hasTailMode ?? false,
          isDoubly:
            animationParams?.isDoubly ?? payloadRecord?.isDoubly ?? false,
        });

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
