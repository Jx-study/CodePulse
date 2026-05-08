import type { RealWorldStory } from "@/types/implementation";

export const dfsRealWorldStories: RealWorldStory[] = [
  {
    id: "dfs-maze-generation",
    title: "DFS 迷宮生成：一筆畫出永不死路的迷宮",
    category: "遊戲開發",
    tags: ["DFS", "遞迴回溯", "完美迷宮", "程式生成"],
    content: `【DFS 與「完美迷宮」的誕生】

第一層：什麼是「完美迷宮」？在迷宮理論裡，它代表迷宮中沒有多餘的環路，任意兩格之間只存在唯一一條路徑——不會繞圈子，也不會走進死巷後還能從另一條路繞回來。許多遊戲關卡美術與程式生成關卡設計師，在需要「可解且路徑唯一」的迷宮時，常會採用這類結構，讓玩家體驗既具挑戰又不會被無限循環搞混的探險感。

【遞迴回溯：DFS 的真正力量】

第二層：深度優先搜尋如何造出這樣的迷宮？演算法從某一格隨機出發，像迷途的探險家一樣，每次挑一個尚未造訪的鄰格，並「打通」兩格之間對應的那一堵牆；若四個方向都走不通，就退回上一層（回溯），改試其他分支。因為每次只打通到「全新」的格子，樹狀結構自然形成，不會出現環——這正是完美迷宮的數學本質。

【你的遊戲，也是 DFS 的足跡】

第三層：下方的小程式用 DFS 遞迴在程式裡畫出迷宮；你在畫面上用鍵盤走的每一步，其實是在親歷這棵由搜尋樹展開的路網。試試單人闖關、雙人競速或合作抵達終點，並開啟迷霧模式，感受「只看得到腳邊」時，路徑唯一性如何影響你的決策。`,
    pythonDemo: {
      title: "DFS 迷宮生成 — 鍵盤操控闖關",
      outputType: "maze",
      inputs: [
        {
          label: "迷宮寬度（格）",
          variable: "maze_width",
          type: "slider",
          default: 21,
          min: 11,
          max: 31,
          step: 2,
        },
        {
          label: "迷宮高度（格）",
          variable: "maze_height",
          type: "slider",
          default: 11,
          min: 7,
          max: 17,
          step: 2,
        },
      ],
      code: `
import json, sys, random
sys.setrecursionlimit(3000)

W = int(globals().get('maze_width',  21))
H = int(globals().get('maze_height', 11))

grid    = [[{"right": False, "down": False} for _ in range(H)] for _ in range(W)]
visited = [[False]*H for _ in range(W)]
steps   = []

def dfs(x, y):
    visited[x][y] = True
    dirs = [(-1,0),(0,-1),(1,0),(0,1)]
    random.shuffle(dirs)
    for dx, dy in dirs:
        nx, ny = x+dx, y+dy
        if 0<=nx<W and 0<=ny<H and not visited[nx][ny]:
            if   dx== 1: grid[x][y]["right"]  = True
            elif dx==-1: grid[nx][ny]["right"] = True
            elif dy== 1: grid[x][y]["down"]   = True
            elif dy==-1: grid[nx][ny]["down"]  = True
            steps.append([x, y, nx, ny])
            dfs(nx, ny)
            steps.append([x, y, -1, -1])

dfs(random.randint(0, W-1), random.randint(0, H-1))

json.dumps({
    "width": W, "height": H,
    "grid": grid,
    "start": [0, 0],
    "finish": [W-1, H-1],
    "generationSteps": steps
})
      `,
    },
  },
  {
    id: "algo-dfs-002",
    title:
      "不撞南牆不回頭的探索哲學——為什麼每個初學者都該學「深度優先搜尋」(DFS)",
    category: "計算機科學 / 演算法",
    tags: ["深度優先搜尋", "回溯法", "拓樸排序", "演算法"],
    content: `【人類直覺的解題模式】
想像你站在一個複雜的迷宮前，第一直覺通常是隨便挑一條路走到盡頭，如果發現是死路撞到牆，就會退回到上一個還有其他路的交叉口，再嘗試另一條路。這種「不撞南牆不回頭」、走到死胡同再「回溯 (Backtracking)」的策略，正是深度優先搜尋 (DFS) 的核心邏輯。DFS 將所有可能性都搜尋一遍，在解決複雜問題（如迷宮、數獨等單一解謎題）時非常直觀且有效。

【現代網路世界的運作基礎】
DFS 不僅能用來解迷宮，它更是現代網路技術的基礎。例如搜尋引擎的網頁爬蟲 (Web Crawler) 就像是一個超大型的 DFS 應用。它會從一個網頁出發，沿著連結不斷往下鑽探（深入探索），藉此發現與收錄全世界的新網頁。

【梳理複雜的依賴關係：拓樸排序】
當問題變成環環相扣的依賴網路時，DFS 的升級版應用「拓樸排序 (Topological Sorting)」就能派上用場。無論是你使用 npm 或 pip 安裝軟體套件時系統計算的安裝先後順序，還是大學選課系統中要求先修完「微積分一」才能修「微積分二」的規則，背後都是依靠 DFS 演算法來理清這些複雜的先後依賴關係。DFS 透過不斷深入直到沒有相鄰節點，再將節點推入堆疊，最後反轉即可得到正確的拓樸排序。

【社群網路的人際關係分析】
在 Facebook 或 LinkedIn 等社群平台上，DFS 可以用來找出網路中的「連通元件 (Connected Components)」，也就是你的交友圈。程式會從你這個節點開始，把所有直接或間接認識的朋友全部圈出來，這種圖論技術能進一步驅動「你可能認識的朋友」這類強大的推薦功能。

【為何初學者必學？記憶體優勢與應用場景】
比起廣度優先搜尋 (BFS) 在岔路多時會把所有相鄰節點存入佇列而消耗大量記憶體，DFS 因為一次只專心走一條路（內部實作通常使用堆疊 Stack 結構或遞迴），在記憶體使用上更具優勢，其空間複雜度僅與最大深度成正比。當你需要偵測圖形中是否有循環 (Cycle)、尋找連通元件、進行拓樸排序，或單純想窮舉所有可能性時，DFS 絕對是最佳選擇。學會了 DFS，就等於拿到了一張挑戰進階演算法的重要門票。`,
    video: {
      url: "https://youtu.be/6JgCciM2kMY",
      title: "為什麼每個初學者都該學「深度優先搜尋」(DFS).mp4",
      duration: "9:58",
    },
    resources: [
      {
        type: "article",
        url: "https://brilliant.org/wiki/depth-first-search-dfs/",
        title: "Depth-First Search (DFS)",
        source: "Brilliant Math & Science Wiki",
      },
      {
        type: "article",
        url: "https://www.hackerearth.com/practice/algorithms/graphs/depth-first-search/tutorial/",
        title: "Depth First Search Tutorials & Notes",
        source: "HackerEarth",
      },
      {
        type: "article",
        url: "https://algocademy.com/blog/",
        title:
          "Algorithms for Social Network Analysis: Unraveling the Web of Connections",
        source: "AlgoCademy Blog",
      },
      {
        type: "article",
        url: "https://fiveable.me/",
        title: "Applications of BFS and DFS",
        source: "Fiveable",
      },
      {
        type: "article",
        url: "https://www.geeksforgeeks.org/",
        title: "Topological Sorting",
        source: "GeeksforGeeks",
      },
      {
        type: "paper",
        url: "https://courses.grainger.illinois.edu/cs374/fa2020/lec_prerec/16/16_4_2_0.pdf",
        title: "16.4.2 DFS and cycle detection: Topological sorting using DFS",
        source: "CS/ECE 374, Fall 2020, University of Illinois",
      },
    ],
  },
];
