import { useState, useEffect, useRef } from "react";

export const useAlgorithmLogic = (config: any) => {
  const [data, setData] = useState<any[]>([]);
  const [activeSteps, setActiveSteps] = useState<any[]>([]);
  const nextIdRef = useRef(100);

  const initData = (rawValues: number[]) => {
    return rawValues.map((val) => ({
      id: `box-${nextIdRef.current++}`,
      value: val,
      position: { x: 0, y: 0 },
    }));
  };

  const generateSteps = (inputData: any[]) => {
    if (config && config.createAnimationSteps) {
      return config.createAnimationSteps(inputData);
    }
    return [];
  };

  useEffect(() => {
    if (config?.defaultData) {
      const initialData = config.defaultData.map((d: any) => ({
        ...d,
        id: d.id || `box-${nextIdRef.current++}`, // 確保有 ID
      }));

      const steps = generateSteps(initialData);

      setData(initialData);
      setActiveSteps(steps);
    }
  }, [config]);

  const executeAction = (actionType: string, payload: any) => {
    let newData = [...data];

    if (actionType === "random") {
      const count = 10;
      const randomValues = Array.from(
        { length: count },
        () => Math.floor(Math.random() * 100) - 20
      );
      newData = initData(randomValues);

      // 隨機資料生成後，立刻計算所有步驟
      const steps = generateSteps(newData);

      setData(newData);
      setActiveSteps(steps);
      // 回傳 steps 讓 Tutorial 可以重置 currentStep
      // 不自動播放 (return null 或空陣列)，除非想自動播
      return steps;
    } else if (actionType === "load") {
      if (payload.data && Array.isArray(payload.data)) {
        newData = initData(payload.data);
        const steps = generateSteps(newData);

        setData(newData);
        setActiveSteps(steps);
        return steps;
      }
      return [];
    } else if (actionType === "reset") {
      newData = (config.defaultData || []).map((d: any) => ({
        ...d,
        id: d.id || `box-${nextIdRef.current++}`,
      }));

      const steps = generateSteps(newData);

      setData(newData);
      setActiveSteps(steps);
      return steps;
    } else if (actionType === "run") {
      // 因為在資料改變時 (random/load/reset) 已經生成好步驟了
      // 這裡只需要回傳當前的 activeSteps 讓 UI 知道要開始播放即可
      // 或者也可以選擇在這裡才生成步驟，這邊假設步驟已就緒
      return activeSteps;
    }

    return [];
  };

  return { data, activeSteps, executeAction };
};
