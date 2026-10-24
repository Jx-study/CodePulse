import type { RealWorldStory } from "@/types/implementation";

export const dfsRealWorldStories: RealWorldStory[] = [
  {
    id: "dfs-maze-generation",
    pythonDemo: {
      outputType: "maze",
      inputs: [
        {
          variable: "maze_width",
          type: "slider",
          default: 21,
          min: 11,
          max: 31,
          step: 2,
        },
        {
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
    video: {
      url: "https://youtu.be/6JgCciM2kMY",
      duration: "9:58",
    },
    resources: [
      {
        type: "article",
        url: "https://brilliant.org/wiki/depth-first-search-dfs/",
      },
      {
        type: "article",
        url: "https://www.hackerearth.com/practice/algorithms/graphs/depth-first-search/tutorial/",
      },
      {
        type: "article",
        url: "https://algocademy.com/blog/",
      },
      {
        type: "article",
        url: "https://fiveable.me/",
      },
      {
        type: "article",
        url: "https://www.geeksforgeeks.org/",
      },
      {
        type: "paper",
        url: "https://courses.grainger.illinois.edu/cs374/fa2020/lec_prerec/16/16_4_2_0.pdf",
      },
    ],
  },
];
