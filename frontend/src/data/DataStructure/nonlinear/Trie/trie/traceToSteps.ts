import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type { AnimationStep, StepDescription } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createTreeNodes } from "@/data/DataStructure/nonlinear/utils";
import { TAGS } from "./tags";

const STATUS_MAP: Record<string, Status> = {
  Target: Status.Target,
  Complete: Status.Complete,
  Prepare: Status.Prepare,
  Unfinished: Status.Unfinished,
};

function toStatus(s?: string): Status {
  return s ? (STATUS_MAP[s] ?? Status.Unfinished) : Status.Unfinished;
}

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: () => ({ key: "trie.init" }),
  [TAGS.INSERT_START]: (e) => ({
    key: "trie.insert_start",
    params: { word: e.local_vars.word },
  }),
  [TAGS.CHAR_MATCH]: (e) => ({
    key: "trie.char_match",
    params: { char: e.local_vars.char, prefix: e.local_vars.prefix },
  }),
  [TAGS.CHAR_CREATE]: (e) => ({
    key: "trie.char_create",
    params: { char: e.local_vars.char, prefix: e.local_vars.prefix },
  }),
  [TAGS.SET_END]: (e) => ({
    key: "trie.set_end",
    params: { word: e.local_vars.word },
  }),
  [TAGS.SEARCH_START]: (e) => ({
    key: "trie.search_start",
    params: { word: e.local_vars.word, mode: e.local_vars.mode },
  }),
  [TAGS.SEARCH_FOUND]: (e) => ({
    key: "trie.search_found",
    params: { word: e.local_vars.word },
  }),
  [TAGS.SEARCH_NOT_FOUND]: (e) => ({
    key: "trie.search_not_found",
    params: { error: e.local_vars.error },
  }),
  [TAGS.DELETE_START]: (e) => ({
    key: "trie.delete_start",
    params: { word: e.local_vars.word },
  }),
  [TAGS.DELETE_UNMARK]: (e) => ({
    key: "trie.delete_unmark",
    params: { word: e.local_vars.word },
  }),
  [TAGS.DELETE_PRUNE]: (e) => ({
    key: "trie.delete_prune",
    params: {
      pruned: e.local_vars.pruned,
      remainingWord: e.local_vars.remainingWord,
    },
  }),
  [TAGS.DELETE_NOT_FOUND]: (e) => ({
    key: "trie.delete_not_found",
    params: { error: e.local_vars.error },
  }),
  [TAGS.DONE]: () => ({ key: "trie.done" }),
};

export function trieTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    // 同時讀取可見路徑與真實單字清單
    const visiblePaths: string[] = event.meta?.visiblePaths || [];
    const realWords: string[] = event.meta?.realWords || [];
    const highlightId = event.meta?.highlightId;
    const overrideStatusMap = event.meta?.overrideStatusMap || {};

    const elements = createTreeNodes(
      { visiblePaths, realWords },
      {
        width: 1400,
        height: 420,
        offsetX: 0,
        offsetY: 50,
        type: "trie",
      },
    );

    elements.forEach((node) => {
      const isHighlighted = node.id === highlightId;
      const customStatus = overrideStatusMap[node.id];

      if (customStatus) {
        node.setStatus(toStatus(customStatus));
      } else if (isHighlighted) {
        node.setStatus(Status.Target);
      } else {
        node.setStatus(Status.Unfinished);
      }
    });

    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      variables: event.local_vars,
      elements: elements as any,
    };
  });
}
