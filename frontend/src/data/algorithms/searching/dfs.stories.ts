import type { RealWorldStory } from '@/types/implementation';

export const dfsRealWorldStories: RealWorldStory[] = [
  {
    id: 'dfs-maze-generation',
    title: 'DFS 迷宮生成：一筆畫出永不死路的迷宮',
    category: '遊戲開發',
    tags: ['DFS', '遞迴回溯', '完美迷宮', '程序生成'],
    content: `【DFS 與「完美迷宮」的誕生】

第一層：什麼是「完美迷宮」？在迷宮理論裡，它代表迷宮中沒有多餘的環路，任意兩格之間只存在唯一一條路徑——不會繞圈子，也不會走進死巷後還能從另一條路繞回來。許多遊戲關卡美術與程序生成關卡設計師，在需要「可解且路徑唯一」的迷宮時，常會採用這類結構，讓玩家體驗既具挑戰又不會被無限循環搞混的探險感。

【遞迴回溯：DFS 的真正力量】

第二層：深度優先搜尋如何造出這樣的迷宮？演算法從某一格隨機出發，像迷途的探險家一樣，每次挑一個尚未造訪的鄰格，並「打通」兩格之間對應的那一堵牆；若四個方向都走不通，就退回上一層（回溯），改試其他分支。因為每次只打通到「全新」的格子，樹狀結構自然形成，不會出現環——這正是完美迷宮的數學本質。

【你的遊戲，也是 DFS 的足跡】

第三層：下方的小程式用 DFS 遞迴在程式裡畫出迷宮；你在畫面上用鍵盤走的每一步，其實是在親歷這棵由搜尋樹展開的路網。試試單人闖關、雙人競速或合作抵達終點，並開啟迷霧模式，感受「只看得到腳邊」時，路徑唯一性如何影響你的決策。`,
    pythonDemo: {
      title: 'DFS 迷宮生成 — 鍵盤操控闖關',
      outputType: 'maze',
      inputs: [
        { label: '迷宮寬度（格）', variable: 'maze_width', type: 'slider', default: 21, min: 11, max: 31, step: 2 },
        { label: '迷宮高度（格）', variable: 'maze_height', type: 'slider', default: 11, min: 7, max: 17, step: 2 },
      ],
      code: `
import json, sys, random
sys.setrecursionlimit(3000)

W = int(globals().get('maze_width',  21))
H = int(globals().get('maze_height', 11))

grid    = [[{"right": False, "down": False} for _ in range(H)] for _ in range(W)]
visited = [[False]*H for _ in range(W)]

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
            dfs(nx, ny)

dfs(random.randint(0, W-1), random.randint(0, H-1))

json.dumps({
    "width": W, "height": H,
    "grid": grid,
    "start": [0, 0],
    "finish": [W-1, H-1]
})
      `,
    },
  },
];
