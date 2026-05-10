import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS } from "./tags";

export function simulateTrieTrace(
  currentWords: string[],
  action: any,
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const { trieType = "init", word = "" } = action || {};

  // 如果是 Insert，一開始的樹「絕對不包含」這個新單字 (除非它原本就是別人的前綴)
  const initialWords = currentWords.filter(
    (w) => !(trieType === "insert" && w === word),
  );

  const realWords = [...initialWords]; // 真正擁有 [Word] 標記的單字
  const visiblePaths = [...initialWords]; // 畫面上當前長出來的所有分支

  const pushTrace = (
    tag: string,
    local_vars: Record<string, any>,
    metaOpts: { highlightId?: string; statusMap?: Record<string, string> } = {},
  ) => {
    trace.push({
      tag,
      local_vars,
      dataSnapshot: [],
      meta: {
        visiblePaths: [...visiblePaths], // 拋出當前長到哪裡的路徑
        realWords: [...realWords], // 拋出真實確認的單字
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

      // 檢查目前畫面上是否已經長出了這個前綴分支
      const alreadyVisible = visiblePaths.some((p) => p.startsWith(prefix));

      if (!alreadyVisible) {
        // 走到這一步才把前綴推入可見路徑中，觸發 D3 即時產出新節點
        visiblePaths.push(prefix);
        pushTrace(
          TAGS.CHAR_CREATE,
          { char, prefix, index: i },
          { highlightId: nodeId, statusMap: { [nodeId]: "Prepare" } },
        );
      } else {
        // 原本就存在的分支，單純順著走訪高亮
        pushTrace(
          TAGS.CHAR_MATCH,
          { char, prefix, index: i },
          { highlightId: nodeId, statusMap: { [nodeId]: "Target" } },
        );
      }
    }

    // 走訪到底畢後，正式將該單字加入確認清單，賦予 [Word] 標記
    if (!realWords.includes(word)) realWords.push(word);
    if (!visiblePaths.includes(word)) visiblePaths.push(word);

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

      if (visiblePaths.some((p) => p.startsWith(prefix))) {
        pushTrace(
          TAGS.CHAR_MATCH,
          { char, prefix, index: i },
          { highlightId: nodeId, statusMap: { [nodeId]: "Target" } },
        );
      } else {
        pushTrace(
          TAGS.SEARCH_NOT_FOUND,
          { char, prefix, error: "分支不存在，比對中斷" },
          { highlightId: `trie-node-${prefix.slice(0, -1) || "root"}` },
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
            statusMap: { [`trie-node-${word}`]: "Complete" },
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
              statusMap: { [finalNodeId]: "Complete" },
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

  return trace;
}
