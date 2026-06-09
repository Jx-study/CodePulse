import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS, TrieStatus } from "./tags";
import { Status } from "@/modules/core/DataLogic/BaseElement";

export function simulateTrieTrace(
  currentWords: string[],
  action: any,
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const { trieType = "init", word = "", existed = false } = action || {};

  const baseWords = currentWords.filter(
    (w) => !(trieType === "insert" && w === word),
  );

  const initialWords = [...baseWords];

  if (trieType === "delete" && existed && !initialWords.includes(word)) {
    initialWords.push(word);
  }

  const realWords = [...initialWords];
  const visiblePaths = [...initialWords];

  const pushTrace = (
    tag: string,
    local_vars: Record<string, any>,
    metaOpts: { highlightId?: string; statusMap?: Record<string, Status> } = {},
  ) => {
    trace.push({
      tag,
      local_vars,
      dataSnapshot: [],
      meta: {
        visiblePaths: [...visiblePaths],
        realWords: [...realWords],
        highlightId: metaOpts.highlightId || "",
        overrideStatusMap: metaOpts.statusMap || {},
      },
    });
  };

  if (trieType === "init") {
    pushTrace(TAGS.INIT, {});
    return trace;
  }

  if (trieType === "insert") {
    pushTrace(TAGS.INSERT_START, { word }, { highlightId: "trie-root" });

    let prefix = "";
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      prefix += char;
      const nodeId = `trie-node-${prefix}`;

      const alreadyVisible = visiblePaths.some((p) => p.startsWith(prefix));

      if (!alreadyVisible) {
        visiblePaths.push(prefix);
        pushTrace(
          TAGS.CHAR_CREATE,
          { char, prefix, index: i },
          {
            highlightId: nodeId,
            statusMap: { [nodeId]: TrieStatus.Create as Status },
          },
        );
      } else {
        pushTrace(
          TAGS.CHAR_MATCH,
          { char, prefix, index: i },
          {
            highlightId: nodeId,
            statusMap: { [nodeId]: TrieStatus.Match as Status },
          },
        );
      }
    }

    if (!realWords.includes(word)) realWords.push(word);
    if (!visiblePaths.includes(word)) visiblePaths.push(word);

    const finalNodeId = `trie-node-${word}`;
    pushTrace(
      TAGS.SET_END,
      { word },
      {
        highlightId: finalNodeId,
        statusMap: { [finalNodeId]: TrieStatus.WordEnd as Status },
      },
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

      if (visiblePaths.some((p) => p.startsWith(prefix))) {
        pushTrace(
          TAGS.CHAR_MATCH,
          { char, prefix, index: i },
          {
            highlightId: nodeId,
            statusMap: { [nodeId]: TrieStatus.Match as Status },
          },
        );
      } else {
        pushTrace(
          TAGS.SEARCH_NOT_FOUND,
          { char, prefix, error: "分支不存在，比對中斷" },
          { highlightId: `trie-node-${prefix.slice(0, -1) || "trie-root"}` },
        );
        matchFailed = true;
        break;
      }
    }

    if (!matchFailed) {
      if (isPrefixSearch) {
        pushTrace(
          TAGS.SEARCH_FOUND,
          { word, result: "前綴比對成功" },
          {
            highlightId: `trie-node-${word}`,
            statusMap: { [`trie-node-${word}`]: TrieStatus.WordEnd as Status },
          },
        );
      } else {
        const isExactWord = realWords.includes(word);
        const finalNodeId = `trie-node-${word}`;
        if (isExactWord) {
          pushTrace(
            TAGS.SEARCH_FOUND,
            { word, result: "完整單字比對成功" },
            {
              highlightId: finalNodeId,
              statusMap: { [finalNodeId]: TrieStatus.WordEnd as Status },
            },
          );
        } else {
          pushTrace(
            TAGS.SEARCH_NOT_FOUND,
            { word, error: "路徑存在，但該處並非單字結尾" },
            { highlightId: finalNodeId },
          );
        }
      }
    }
    pushTrace(TAGS.DONE, {});
  }

  if (trieType === "delete") {
    pushTrace(TAGS.DELETE_START, { word }, { highlightId: "trie-root" });

    let prefix = "";
    let pathExists = true;

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      prefix += char;
      const nodeId = `trie-node-${prefix}`;

      if (visiblePaths.some((p) => p.startsWith(prefix))) {
        pushTrace(
          TAGS.CHAR_MATCH,
          { char, prefix, index: i },
          {
            highlightId: nodeId,
            statusMap: { [nodeId]: TrieStatus.Match as Status },
          },
        );
      } else {
        pathExists = false;
        pushTrace(
          TAGS.DELETE_NOT_FOUND,
          { word, error: `前綴 '${prefix}' 不存在，無法刪除` },
          { highlightId: `trie-node-${prefix.slice(0, -1) || "trie-root"}` },
        );
        break;
      }
    }

    if (pathExists) {
      const isExactWord = realWords.includes(word);
      const finalNodeId = `trie-node-${word}`;

      if (!isExactWord) {
        pushTrace(
          TAGS.DELETE_NOT_FOUND,
          { word, error: `路徑存在，但 '${word}' 並非單字結尾` },
          { highlightId: finalNodeId },
        );
      } else {
        const wordIdx = realWords.indexOf(word);
        if (wordIdx !== -1) realWords.splice(wordIdx, 1);

        pushTrace(
          TAGS.DELETE_UNMARK,
          { word },
          {
            highlightId: finalNodeId,
            statusMap: { [finalNodeId]: TrieStatus.Create as Status },
          },
        );

        let checkPrefix = word;

        while (checkPrefix.length > 0) {
          const stillNeeded = realWords.some((w) => w.startsWith(checkPrefix));

          if (!stillNeeded) {
            const pathIdx = visiblePaths.indexOf(checkPrefix);
            if (pathIdx !== -1) {
              const parentPrefix = checkPrefix.slice(0, -1);
              if (parentPrefix.length > 0) {
                visiblePaths[pathIdx] = parentPrefix;
              } else {
                visiblePaths.splice(pathIdx, 1);
              }
            }

            const parentNodeId =
              checkPrefix.length > 1
                ? `trie-node-${checkPrefix.slice(0, -1)}`
                : "trie-root";

            pushTrace(
              TAGS.DELETE_PRUNE,
              {
                pruned: checkPrefix,
                remainingWord: checkPrefix.slice(0, -1) || "Root",
              },
              { highlightId: parentNodeId },
            );
          } else {
            break;
          }
          checkPrefix = checkPrefix.slice(0, -1);
        }
      }
    }

    pushTrace(TAGS.DONE, {});
  }

  return trace;
}
