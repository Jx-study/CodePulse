import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";

import { TrieActionBar } from "./TrieActionBar";
import { TAGS } from "./trie/tags";

const TRIE_MAX_WORDS = 20;
import { simulateTrieTrace } from "./trie/simulateTrace";
import { trieTraceToSteps } from "./trie/traceToSteps";

const baseActionHandler = createLinearActionHandler();

function trieActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: any[], // data 會是字串陣列
  context: ActionContext,
): ActionResult<any[]> | null {
  const currentWords = [...data];

  if (actionType === "load") {
    let parsedWords: string[] = [];

    if (Array.isArray(payload.data)) {
      // 如果外層已經切好陣列了，直接清洗裡面的元素
      parsedWords = payload.data
        .map((w) =>
          String(w)
            .replace(/[^a-zA-Z]/g, "")
            .toLowerCase(),
        )
        .filter(Boolean);
    } else if (typeof payload.data === "string") {
      // 如果外層傳的是原始字串，就先 split 再清洗
      const rawDataStr = payload.data || "";
      parsedWords = rawDataStr
        .replace("TRIE:", "") // 保險起見，拔掉前綴
        .split(/[\s,]+/)
        .map((w) => w.replace(/[^a-zA-Z]/g, "").toLowerCase())
        .filter(Boolean);
    }

    const uniqueWords = Array.from(new Set(parsedWords)).slice(0, TRIE_MAX_WORDS);

    return {
      animationData: uniqueWords,
      animationParams: { isTrieAction: true, trieType: "init" }, // 直接重繪初始狀態
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }

  if (actionType === "random") {
    const count = (payload.count as number) || 5;

    // 智慧型隨機字串池：精心挑選高機率共用字根的組合，讓樹狀圖具備美感
    const wordPool = [
      "app",
      "apple",
      "apply",
      "ape",
      "bat",
      "bath",
      "ball",
      "bag",
      "cat",
      "car",
      "cart",
      "care",
      "dog",
      "dot",
      "door",
      "does",
      "bee",
      "beer",
      "best",
      "bed",
      "sun",
      "sunny",
      "set",
      "sad",
    ];

    // 洗牌演算法 (Fisher-Yates Shuffle)
    const shuffled = [...wordPool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 取出指定數量的單字
    const randomWords = shuffled.slice(0, count);

    return {
      animationData: randomWords,
      animationParams: { isTrieAction: true, trieType: "init" },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }

  if (actionType === "reset") {
    const defaultWords = ["app", "apple", "cat"];
    return {
      animationData: defaultWords,
      animationParams: { isTrieAction: true, trieType: "init" },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }

  if (actionType === "insert") {
    const word = String(payload.word);
    if (!currentWords.includes(word)) {
      currentWords.push(word);
    }
    return {
      animationData: currentWords,
      animationParams: { isTrieAction: true, trieType: "insert", word },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }

  if (actionType === "search" || actionType === "startsWith") {
    const word = String(payload.word);
    return {
      animationData: currentWords,
      animationParams: { isTrieAction: true, trieType: actionType, word },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }

  if (actionType === "delete") {
    const word = String(payload.word);
    const index = currentWords.indexOf(word);
    const existed = index !== -1;

    // 如果確實在底層陣列中，將其徹底移出
    if (index !== -1) {
      currentWords.splice(index, 1);
    }

    return {
      animationData: currentWords,
      animationParams: {
        isTrieAction: true,
        trieType: "delete",
        word,
        existed,
      },
      isResetAction: true,
      useRawAnimationParams: true,
    };
  }

  return baseActionHandler(actionType, payload, data, context);
}

export function createTrieAnimationSteps(
  dataList: any[],
  action?: any,
): AnimationStep[] {
  const params = action?.isTrieAction ? action : action?.animationParams;

  if (params && params.isTrieAction) {
    // 若為 Search 動作，傳入原本沒變的陣列；若為 Insert，因為最後新增了，選擇直接推演
    const trace = simulateTrieTrace(dataList, params);
    return trieTraceToSteps(trace);
  }

  const trace = simulateTrieTrace(dataList, { trieType: "init" });
  return trieTraceToSteps(trace);
}

const trieCodeConfig: CodeConfig = {
  pseudo: {
    content: `Class TrieNode:
  children ← Map()
  isEndOfWord ← False

Class Trie:
  Procedure Insert(word):
    curr ← root
    For char In word Do
      If Not curr.children.contains(char) Then
        curr.children[char] ← new TrieNode()
      curr ← curr.children[char]
    curr.isEndOfWord ← True

  Procedure Search(word, isPrefixMode):
    curr ← root
    For char In word Do
      If Not curr.children.contains(char) Then
        Return False
      curr ← curr.children[char]
    Return isPrefixMode Or curr.isEndOfWord`,
    mappings: {
      [TAGS.INSERT_START]: [7],
      [TAGS.CHAR_CREATE]: [10, 11],
      [TAGS.CHAR_MATCH]: [12],
      [TAGS.SET_END]: [13],
      [TAGS.SEARCH_START]: [15, 16],
      [TAGS.SEARCH_NOT_FOUND]: [19],
      [TAGS.SEARCH_FOUND]: [21],
    },
  },
  python: {
    content: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str):
        curr = self.root
        for char in word:
            if char not in curr.children:
                curr.children[char] = TrieNode()
            curr = curr.children[char]
        curr.is_end_of_word = True

    def search(self, word: str, is_prefix: bool = False) -> bool:
        curr = self.root
        for char in word:
            if char not in curr.children:
                return False
            curr = curr.children[char]
        return True if is_prefix else curr.is_end_of_word`,
    lineComplexity: [
      { lineNumber: 1,  complexity: 'O(1)'                  },  // class TrieNode:
      { lineNumber: 2,  complexity: 'O(1)'                  },  // def __init__(self):
      { lineNumber: 3,  complexity: 'O(1)'                  },  // self.children = {}
      { lineNumber: 4,  complexity: 'O(1)'                  },  // self.is_end_of_word = False
      { lineNumber: 6,  complexity: 'O(1)'                  },  // class Trie:
      { lineNumber: 7,  complexity: 'O(1)'                  },  // def __init__(self):
      { lineNumber: 8,  complexity: 'O(1)'                  },  // self.root = TrieNode()
      { lineNumber: 10, complexity: 'O(n)'                  },  // def insert(self, word: str): — overall O(n)
      { lineNumber: 11, complexity: 'O(1)'                  },  // curr = self.root — simple assign outside loop
      { lineNumber: 12, complexity: 'O(n)'                  },  // for char in word — top-level for, O(n) iterations
      { lineNumber: 13, complexity: 'O(1)', context: 'O(n)' },  // if char not in curr.children — O(1) × n
      { lineNumber: 14, complexity: 'O(1)', context: 'O(n)' },  // curr.children[char] = TrieNode() — O(1) × n
      { lineNumber: 15, complexity: 'O(1)', context: 'O(n)' },  // curr = curr.children[char] — O(1) × n
      { lineNumber: 16, complexity: 'O(1)'                  },  // curr.is_end_of_word = True — outside loop
      { lineNumber: 18, complexity: 'O(n)'                  },  // def search(self, word: str, ...): — overall O(n)
      { lineNumber: 19, complexity: 'O(1)'                  },  // curr = self.root — simple assign outside loop
      { lineNumber: 20, complexity: 'O(n)'                  },  // for char in word — top-level for, O(n) iterations
      { lineNumber: 21, complexity: 'O(1)', context: 'O(n)' },  // if char not in curr.children — O(1) × n
      { lineNumber: 22, complexity: 'O(1)' },  // return False — inside loop, O(1) × n
      { lineNumber: 23, complexity: 'O(1)', context: 'O(n)' },  // curr = curr.children[char] — O(1) × n
      { lineNumber: 24, complexity: 'O(1)'                  },  // return ... — outside loop
    ],
  },
};

export const TrieConfig: LevelImplementationConfig = {
  id: "trie",
  type: "dataStructure",
  name: "字典樹 (Trie / 前綴樹)",
  categoryName: "樹狀結構",
  description: "支援高效率字串前綴搜尋與儲存的多叉樹狀結構。",
  codeConfig: trieCodeConfig,
  complexity: {
    timeBest: "O(m)", // m 為字串長度
    timeAverage: "O(m)",
    timeWorst: "O(m)",
    space: "O(N * m)", // 總字元數量
  },
  i18nNamespace: "tutorials/trie",
  introduction: { key: "introduction" },
  defaultData: ["app", "apple", "cat"], // 預設資料即為字串陣列
  createAnimationSteps: createTrieAnimationSteps,
  actionHandler: trieActionHandler,
  renderActionBar: (props) => <TrieActionBar {...(props as any)} />,
  maxNodes: TRIE_MAX_WORDS,
};
