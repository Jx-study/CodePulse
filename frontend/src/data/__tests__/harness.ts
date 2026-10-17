import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, vi } from "vitest";
import { toast } from "@/shared/components/Toast";
import { useVisualizationLogic } from "@/modules/core/hooks/useVisualizationLogic";
import { showStepNotice } from "@/pages/Tutorial/stepNotice";
import type { LevelImplementationConfig } from "@/types/implementation";
import type { AnimationStep } from "@/types";

const mountedRoots: Root[] = [];

afterEach(() => {
  mountedRoots.splice(0).forEach((root) => act(() => root.unmount()));
  vi.restoreAllMocks();
});

function renderHook<T>(hook: () => T) {
  const result = { current: undefined as T };
  const root = createRoot(document.createElement("div"));
  mountedRoots.push(root);
  const Probe = () => {
    result.current = hook();
    return null;
  };
  act(() => root.render(createElement(Probe)));
  return { result };
}

interface Flags {
  isDoubly?: boolean;
  hasTailMode?: boolean;
}

const echoKey = (key: string) => key;

/**
 * 以真正的 useVisualizationLogic 掛載一個資料結構，並用 Tutorial.tsx 送出的
 * payload 形狀呼叫（handleAddNode／handleDeleteNode／handleSearchNode／
 * handlePeek／handleCustomAction／handleGraphAction）。播放步驟時走同一份
 * showStepNotice，所以 toast 是步驟實際觸發的，而不是測試端組出來的。
 * 若 Tutorial.tsx 的這些 handler 改了，這裡要一起改。
 */
export function mountStructure(
  config: LevelImplementationConfig,
  flags: Flags = {},
  defaultData?: unknown,
) {
  const { isDoubly = false, hasTailMode = false } = flags;
  const cfg = defaultData === undefined ? config : { ...config, defaultData };
  const warning = vi.spyOn(toast, "warning").mockImplementation(() => undefined);
  const info = vi.spyOn(toast, "info").mockImplementation(() => undefined);
  const { result } = renderHook(() => useVisualizationLogic(cfg));
  const maxNodes = config.maxNodes;

  const count = (): number =>
    result.current.data?.length ?? result.current.data?.nodes?.length ?? 0;

  const exec = (action: string, payload: unknown): AnimationStep[] => {
    let steps: AnimationStep[] = [];
    act(() => {
      steps = result.current.executeAction(action, payload);
    });
    steps.forEach((step) => showStepNotice(step, echoKey));
    return steps;
  };

  return {
    warning,
    info,
    count,
    exec,

    add(value: number, mode: string, index?: number) {
      let overflow = false;
      if (maxNodes !== undefined) {
        if (count() >= maxNodes && !config.hasCapacityGuard) {
          toast.warning("toast.maxNodesExceeded");
          return [];
        }
        overflow = count() >= maxNodes;
      }
      return exec("add", {
        value,
        mode,
        index,
        hasTailMode,
        isDoubly,
        overflow,
      });
    },

    remove(mode: string, index?: number) {
      return exec("delete", { mode, index, hasTailMode, isDoubly });
    },

    search(value: number, mode?: string) {
      return exec("search", { value, mode, hasTailMode, isDoubly });
    },

    peek() {
      return exec("peek", { hasTailMode });
    },

    custom(action: string, payload: Record<string, unknown> = {}) {
      if (action === "add" && maxNodes !== undefined && count() >= maxNodes) {
        toast.warning("toast.maxNodesExceeded");
        return [];
      }
      if (
        (action === "delete" || action === "peek") &&
        count() === 0 &&
        !config.hasEmptyGuard
      ) {
        toast.warning("toast.emptyDataOperation");
        return [];
      }
      return exec(action, payload);
    },

    graph(action: string, payload: Record<string, unknown> = {}) {
      return exec(action, payload);
    },
  };
}
