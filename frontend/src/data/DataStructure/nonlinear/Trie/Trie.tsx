import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import { createLinearActionHandler } from "@/data/shared/animationUtils/linearAction";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";

import { TrieActionBar } from "./TrieActionBar";
import { TAGS } from "./trie/tags";
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
  introduction:
    "字典樹 (Trie) 是一種針對「字串搜尋」極度優化的多叉樹結構！\n\n觀察視覺化，你會發現擁有相同前綴 (Prefix) 的單字會**共用相同的路徑節點**，這大幅節省了儲存空間。\n注意觀察：每個節點內部只儲存單一字元，當到達一個完整單字的結尾時，節點下方會特別標註 `[Word]` 作為結束識別！",
  defaultData: ["app", "apple", "cat"], // 預設資料即為字串陣列
  createAnimationSteps: createTrieAnimationSteps,
  actionHandler: trieActionHandler,
  renderActionBar: (props) => <TrieActionBar {...(props as any)} />,
  maxNodes: 25,
};
