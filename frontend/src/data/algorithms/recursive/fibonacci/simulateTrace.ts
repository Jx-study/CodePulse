import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type { HierarchyDatum } from "@/data/DataStructure/nonlinear/utils";
import { TAGS } from "./tags";

export function simulateFibonacciTrace(targetN: number): ExecutionTrace {
  const trace: TraceEvent[] = [];

  // 動態樹的根節點
  const rootNode: HierarchyDatum = {
    id: "fib-root",
    value: `f(${targetN})`,
    children: [],
  };

  const statusMap: Record<string, string> = {};
  const valueMap: Record<string, number> = {};

  const pushTrace = (tag: string, local_vars: any, highlightId?: string) => {
    trace.push({
      tag,
      local_vars,
      dataSnapshot: [], // 不使用 dataSnapshot，交給 meta 的 tree 產生
      meta: {
        tree: structuredClone(rootNode), // deep clone so each trace frame captures an independent snapshot
        statusMap: { ...statusMap },
        valueMap: { ...valueMap },
        highlightId,
      },
    });
  };

  pushTrace(TAGS.FIB_START, { targetN }, "fib-root");

  // DFS 模擬呼叫過程
  function simulate(n: number, currentNode: HierarchyDatum): number {
    statusMap[currentNode.id] = "Target";
    pushTrace(TAGS.FIB_CALL, { n }, currentNode.id);

    statusMap[currentNode.id] = "Unfinished";

    // Base Case
    if (n <= 1) {
      valueMap[currentNode.id] = n;
      statusMap[currentNode.id] = "Complete";
      pushTrace(TAGS.FIB_BASE, { n, result: n }, currentNode.id);
      return n;
    }

    // 動態生長：呼叫左子樹，並當下將其加入 children 中
    const leftChild: HierarchyDatum = {
      id: `${currentNode.id}-L`,
      value: `f(${n - 1})`,
      children: [],
    };
    currentNode.children = [leftChild];
    const leftVal = simulate(n - 1, leftChild);

    // 動態生長：呼叫右子樹，並當下將其加入 children 中
    const rightChild: HierarchyDatum = {
      id: `${currentNode.id}-R`,
      value: `f(${n - 2})`,
      children: [],
    };
    currentNode.children.push(rightChild);
    const rightVal = simulate(n - 2, rightChild);

    // 合併計算結果
    const result = leftVal + rightVal;
    valueMap[currentNode.id] = result;
    statusMap[currentNode.id] = "Complete";

    pushTrace(TAGS.FIB_CALC, { n, leftVal, rightVal, result }, currentNode.id);

    return result;
  }

  const finalResult = simulate(targetN, rootNode);

  pushTrace(TAGS.FIB_DONE, { result: finalResult });

  return trace;
}
