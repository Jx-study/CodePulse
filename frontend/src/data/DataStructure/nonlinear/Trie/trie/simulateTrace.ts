import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { TAGS } from "./tags";

export function simulateTrieTrace(
  currentWords: string[],
  action: any,
): ExecutionTrace {
  const trace: TraceEvent[] = [];
  const { trieType = "init", word = "", existed = false } = action || {};

  // 1. 如果是 Insert，初始畫面不含該單字 (準備動態生長)
  const baseWords = currentWords.filter(
    (w) => !(trieType === "insert" && w === word),
  );

  const initialWords = [...baseWords];

  // 2. 如果是 Delete 且該單字原本確實存在，因為外層已提前移出陣列，
  // 必須在初始畫面的記憶體中「把它加回來」，才能順利呈現完整的走訪與修剪動畫！
  if (trieType === "delete" && existed && !initialWords.includes(word)) {
    initialWords.push(word);
  }

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

  if (trieType === "delete") {
    pushTrace(TAGS.DELETE_START, { word }, { highlightId: "trie-root" });

    let prefix = "";
    let pathExists = true;

    // 1. 沿著樹往下尋找目標單字路徑
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
        pathExists = false;
        pushTrace(
          TAGS.DELETE_NOT_FOUND,
          { word, error: `前綴 '${prefix}' 不存在，無法刪除` },
          { highlightId: `trie-node-${prefix.slice(0, -1) || "root"}` },
        );
        break;
      }
    }

    if (pathExists) {
      const isExactWord = realWords.includes(word);
      const finalNodeId = `trie-node-${word}`;

      if (!isExactWord) {
        // 路徑存在，但根本不是有效單字結尾
        pushTrace(
          TAGS.DELETE_NOT_FOUND,
          { word, error: `路徑存在，但 '${word}' 並非單字結尾` },
          { highlightId: finalNodeId },
        );
      } else {
        // 拔除單字標記 (取消 isEndOfWord)
        const wordIdx = realWords.indexOf(word);
        if (wordIdx !== -1) realWords.splice(wordIdx, 1);

        pushTrace(
          TAGS.DELETE_UNMARK,
          { word },
          { highlightId: finalNodeId, statusMap: { [finalNodeId]: "Prepare" } },
        );

        // 自底端向上檢查枯枝並修剪 (Bottom-up Pruning)
        // 從最長的字串一路往回縮到第一個字元
        let checkPrefix = word;

        while (checkPrefix.length > 0) {
          // 判斷剩下的 realWords 中，是否還有任何單字是以這個 checkPrefix 開頭的？
          const stillNeeded = realWords.some((w) => w.startsWith(checkPrefix));

          if (!stillNeeded) {
            // 不要直接 splice 刪掉整條路徑！
            // 而是將它「縮短一個字元」替換成父前綴，這樣 D3 才會一格一格往上縮減節點
            const pathIdx = visiblePaths.indexOf(checkPrefix);
            if (pathIdx !== -1) {
              const parentPrefix = checkPrefix.slice(0, -1);
              if (parentPrefix.length > 0) {
                // 替換成上一層前綴 (例如 "apple" 變成 "appl")
                visiblePaths[pathIdx] = parentPrefix;
              } else {
                // 如果已經縮到沒有字元了，才真正將這筆路徑移出
                visiblePaths.splice(pathIdx, 1);
              }
            }

            // 取得退回的父節點 ID 作為高亮焦點
            const parentNodeId =
              checkPrefix.length > 1
                ? `trie-node-${checkPrefix.slice(0, -1)}`
                : "trie-root";

            // 觸發修剪影格，精準呈現單一節點消失的過場
            pushTrace(
              TAGS.DELETE_PRUNE,
              {
                pruned: checkPrefix,
                remainingWord: checkPrefix.slice(0, -1) || "Root",
              },
              { highlightId: parentNodeId },
            );
          } else {
            // 一旦遇到仍然被其他人需要的分岔點，修剪立刻停止
            break;
          }

          // 繼續往上檢查上一層前綴
          checkPrefix = checkPrefix.slice(0, -1);
        }
      }
    }

    pushTrace(TAGS.DONE, {});
  }

  return trace;
}
