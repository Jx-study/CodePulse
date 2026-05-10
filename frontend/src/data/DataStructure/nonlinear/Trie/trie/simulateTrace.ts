import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS } from "./tags";

export function simulateTrieTrace(
  currentWords: string[],
  action: any,
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const wordsList = [...currentWords];

  const pushTrace = (
    tag: string,
    local_vars: Record<string, any>,
    metaOpts: {
      highlightId?: string;
      statusMap?: Record<string, string>;
    } = {},
  ) => {
    trace.push({
      tag,
      local_vars,
      dataSnapshot: wordsList.map((w) => ({ id: w, value: w })),
      meta: {
        words: [...wordsList],
        highlightId: metaOpts.highlightId || "",
        overrideStatusMap: metaOpts.statusMap || {},
      },
    });
  };

  if (!action || action.trieType === "init") {
    pushTrace(TAGS.INIT, {});
    return trace;
  }

  const { trieType, word } = action;

  if (trieType === "insert") {
    pushTrace(TAGS.INSERT_START, { word }, { highlightId: "trie-root" });

    let prefix = "";
    let tempWords = [...wordsList];
    if (!tempWords.includes(word)) {
      tempWords.push(word);
    }

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      prefix += char;
      const nodeId = `trie-node-${prefix}`;

      if (!wordsList.some((w) => w.startsWith(prefix))) {
        // 如果當前樹中完全沒有這個前綴，視為字元節點新建
        pushTrace(
          TAGS.CHAR_CREATE,
          { char, prefix, index: i },
          { highlightId: nodeId, statusMap: { [nodeId]: "Prepare" } },
        );
      } else {
        // 已有該字元節點，平滑走訪
        pushTrace(
          TAGS.CHAR_MATCH,
          { char, prefix, index: i },
          { highlightId: nodeId, statusMap: { [nodeId]: "Target" } },
        );
      }
    }

    // 正式確保單字在陣列中
    if (!wordsList.includes(word)) {
      wordsList.push(word);
    }

    const finalNodeId = `trie-node-${word}`;
    pushTrace(
      TAGS.SET_END,
      { word },
      { highlightId: finalNodeId, statusMap: { [finalNodeId]: "Complete" } },
    );

    pushTrace(TAGS.DONE, {});
  } else if (trieType === "search" || trieType === "startsWith") {
    const isPrefixSearch = trieType === "startsWith";
    pushTrace(
      TAGS.SEARCH_START,
      { word, mode: trieType },
      { highlightId: "trie-root" },
    );

    let prefix = "";
    let matchFailed = false;

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      prefix += char;
      const nodeId = `trie-node-${prefix}`;

      // 檢查目前已有的單字中，是否真的有這個前綴
      const hasPrefix = wordsList.some((w) => w.startsWith(prefix));

      if (hasPrefix) {
        pushTrace(
          TAGS.CHAR_MATCH,
          { char, prefix, index: i },
          { highlightId: nodeId, statusMap: { [nodeId]: "Target" } },
        );
      } else {
        pushTrace(
          TAGS.SEARCH_NOT_FOUND,
          { char, prefix, error: "Path disconnected" },
          { highlightId: `trie-node-${prefix.slice(0, -1) || "root"}` }, // 停留在上一個成功的節點
        );
        matchFailed = true;
        break;
      }
    }

    if (!matchFailed) {
      if (isPrefixSearch) {
        // StartsWith 只要走完就算成功
        pushTrace(
          TAGS.SEARCH_FOUND,
          { word, result: "Prefix Match Success" },
          {
            highlightId: `trie-node-${word}`,
            statusMap: { [`trie-node-${word}`]: "Complete" },
          },
        );
      } else {
        // 精確搜尋必須確認是否真的是單字結尾 (存在陣列中)
        const isExactWord = wordsList.includes(word);
        const finalNodeId = `trie-node-${word}`;

        if (isExactWord) {
          pushTrace(
            TAGS.SEARCH_FOUND,
            { word, result: "Exact Word Match Success" },
            {
              highlightId: finalNodeId,
              statusMap: { [finalNodeId]: "Complete" },
            },
          );
        } else {
          pushTrace(
            TAGS.SEARCH_NOT_FOUND,
            { word, error: "Prefix exists, but NOT marked as end of word" },
            { highlightId: finalNodeId },
          );
        }
      }
    }

    pushTrace(TAGS.DONE, {});
  }

  return trace;
}
