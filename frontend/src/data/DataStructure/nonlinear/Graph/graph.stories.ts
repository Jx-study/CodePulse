import type { RealWorldStory } from '@/types/implementation';

export const graphRealWorldStories: RealWorldStory[] = [
  {
    id: "graph-netflix-recommendation",
    title: "Netflix 推薦系統：一場價值百億美元的「圖論相親」",
    category: "串流平台",
    tags: ["二分圖", "BFS", "協同過濾"],
    content: `你正在瀏覽的這份程式碼，正是 Netflix 推薦引擎的縮影。

【二分圖的資料結構】
Netflix 把世界看作一個巨大的圖結構。在你的 defaultData 中，節點 (Vertex) 被分為兩群：使用者與影視內容。你的每一次觀看，都會觸發 runAddEdge 函式，在使用者與電影之間畫下一條「邊 (Edge)」。

【鄰居搜尋與推薦】
當系統要推薦新片時，它會對「你的節點」執行 runGetNeighbors。透過讀取 Adjacency List，演算法就像一個機器人，先找到你喜歡的電影，再透過這些電影找到「也喜歡它們的其他使用者」。這種「順藤摸瓜」的走訪過程，本質上就是你程式碼中的 BFS 或連通性檢查邏輯。

【商業價值的體現】
根據 Netflix 官方論文，如果使用者在 60 到 90 秒內找不到想看的片，就會離開。透過圖論優化的極致搜尋速度，大幅降低了退訂率 (Churn Rate)。這份看似抽象的節點與邊的運算，每年為 Netflix 節省了超過 10 億美元。`,
    video: {
      url: "https://www.youtube.com/watch?v=8RmrQkzvQeI",
      title: "How Netflix's Recommendation Algorithm Works",
      duration: "8:24",
    },
    resources: [
      {
        type: "paper",
        url: "https://dl.acm.org/doi/10.1145/2843948",
        title: "The Netflix Recommender System",
        source: "ACM",
      },
      {
        type: "article",
        url: "https://netflixtechblog.com/tag/recommendations/",
        title: "Netflix Tech Blog: Recommendations",
        source: "Netflix Tech Blog",
      },
    ],
    pythonDemo: {
      title: "模擬二分圖推薦：依觀看記錄找出推薦內容",
      inputs: [
        {
          label: "用戶 A 看了幾部",
          variable: "user_a_count",
          type: "slider",
          default: 3,
          min: 1,
          max: 6,
          step: 1,
        },
      ],
      code: `# Python 3.10+, no external dependencies required
# Run locally: python graph_recommendation.py
from collections import defaultdict

# 二分圖：用戶 → 影片
user_a_count = globals().get('user_a_count', 3)  # 預設 3，由 UI Slider 覆蓋

watched_by_user = {
    "A": [f"Movie-{i}" for i in range(1, user_a_count + 1)],
    "B": ["Movie-2", "Movie-3", "Movie-5"],
    "C": ["Movie-1", "Movie-4", "Movie-6"],
}

# 協同過濾：找出與 A 觀看相同影片的其他用戶
def find_recommendations(graph, target_user):
    watched = set(graph[target_user])
    similar_users = [
        u for u, movies in graph.items()
        if u != target_user and watched & set(movies)
    ]
    candidate_movies = set()
    for u in similar_users:
        candidate_movies.update(graph[u])
    recommendations = candidate_movies - watched
    return sorted(recommendations), similar_users

recs, similar = find_recommendations(watched_by_user, "A")
print(f"用戶 A 已觀看（{user_a_count} 部）：{sorted(watched_by_user['A'])}")
print(f"品味相似用戶：{similar}")
print(f"推薦影片：{recs}")
print()
print("── 圖結構（鄰接表）──")
for user, movies in watched_by_user.items():
    print(f"  {user} → {movies}")
`,
    },
  },
  {
    id: "graph-social-network",
    title: "【演算法揭密】臉書如何瞬間推薦好友？——從六度分隔到社交圖譜",
    category: "社群媒體",
    tags: ["社交圖譜", "圖形資料庫", "三元閉包"],
    content: `「六度分隔理論」指出，世界上任何兩個陌生人之間最多只隔了六個人。然而，要在 Facebook 幾十億使用者的資料海中瞬間找出「誰是誰的朋友的誰的朋友」，對工程師來說是個天大的噩夢。如果使用傳統的資料庫，尋找關聯性就像在各自獨立的巨大 Excel 表格間進行超複雜的交叉比對（Join），會引發所謂的「運算大爆發」，導致系統卡頓數秒甚至幾分鐘之久。

【圖譜魔法：天生為了「連結」而生】
為了解決這個難題，Facebook 採用了顛覆性的思考模型：「圖形資料庫（Graph Database）」。這種資料庫就像大腦的神經網路，天生就是為連結而生。它的基本材料只有兩種：代表獨立物件的「節點（Node）」（例如用戶、貼文、相片），以及代表物件間關係的「邊（Edge）」（例如交友關係、按讚）。成千上萬億條的邊，把所有孤立的節點編織成了一張活生生的巨大關係網。

【破解「你可能認識的朋友」：三元閉包與毫秒級運算】
Facebook 精準的「你可能認識的朋友」推薦機制是怎麼做到的？邏輯其實很簡單：如果系統知道你（節點 A）和 Alex（節點 B）是朋友，而 Alex 和 Sam（節點 C）也是朋友，系統根本不需要翻找龐大的表格，只需沿著線「走兩步」，就能推測你和 Sam 很可能也認識。這個原理稱為「三元閉包（Triadic Closure）」。在圖形資料庫中，這整個尋找過程只需要短短幾「毫秒」，與傳統資料庫的幾分鐘相比，完全是不同次元的戰爭。

【看透社群影響力：標籤屬性與中心性】
社交圖譜不僅能記錄朋友關係，還能透過「標籤屬性圖」讓邊帶有屬性（例如記錄按讚的時間），大幅提升數據的深度。此外，透過分析網路結構，能算出使用者的「程度中心性」（連出去的線越多，人氣指數越高），或是「中介中心性」（扮演連接兩個不認識社群的橋樑角色），藉此找出在資訊傳播鏈上佔據重要戰略位置的關鍵人物。誠如 Meta 官方文件所認證，這個基於真實世界複雜網路所建立的 Graph 概念，正是整個平台的根基。`,
    video: {
      url: "https://youtu.be/OlXfIFq-gDI",
      title: "【演算法揭密】臉書如何瞬間推薦好友？帶你搞懂「社交圖譜」與「圖形資料庫」的底層邏輯！",
      duration: "7:45",
    },
    resources: [
      {
        type: "link",
        url: "https://developers.facebook.com/docs/graph-api",
        title: "Meta Graph API 總覽",
        source: "Meta 開發者文件",
      },
      {
        type: "article",
        url: "https://www.puppygraph.com/blog/social-network-graphs#what-is-a-social-network-graph",
        title: "Social Network Graphs: Concepts, Metrics & Tools",
        source: "PuppyGraph Blog",
      },
    ],
    pythonDemo: {
      title: "模擬 Facebook 社交圖譜：三元閉包好友推薦",
      outputType: 'graph',
      inputs: [
        {
          label: "用戶數量",
          variable: "num_users",
          type: "slider",
          default: 10,
          min: 6,
          max: 15,
          step: 1,
        },
        {
          label: "社群數量",
          variable: "num_communities",
          type: "slider",
          default: 3,
          min: 2,
          max: 4,
          step: 1,
        },
        {
          label: "友誼密度",
          variable: "density_slider",
          type: "slider",
          default: 5,
          min: 1,
          max: 9,
          step: 1,
        },
      ],
      code: `# Python 3.10+, no external dependencies required
# 最後一個表達式的值（json.dumps(...)）會被 React 接收為圖形資料
import json
import random
from collections import defaultdict

# ── 讀取 UI 參數 ──────────────────────────────────────
num_users       = globals().get('num_users', 10)
num_communities = globals().get('num_communities', 3)
density         = globals().get('density_slider', 5) / 15.0  # 1-9 → 0.07~0.6

# ── 用戶名稱庫 ────────────────────────────────────────
NAMES = [
    "You", "Alice", "Bob", "Charlie", "Diana", "Eve",
    "Frank", "Grace", "Henry", "Iris", "Jack", "Karen",
    "Leo", "Mary", "Nick", "Olivia",
]
NAMES += [f"User{i}" for i in range(16, 30)]

random.seed(42)

# ── 建立節點（id=0 永遠是 "You"，group=0）─────────────
nodes = [
    {
        "id": i,
        "name": NAMES[i] if i < len(NAMES) else f"User{i}",
        "group": 0 if i == 0 else ((i % num_communities) + 1),
        "degree": 0,
        "centrality": 0.0,
    }
    for i in range(num_users)
]

# ── 初始朋友上限（用戶數越多難度越高：6→1人, 10→2人, 15→3人）──
max_you_friends = max(1, num_users // 5)

# ── 建立邊（同社群朋友機率高，跨社群機率低）──────────
edges = []
edge_set = set()

# 其他用戶之間的邊（不含 You）
for i in range(1, num_users):
    for j in range(i + 1, num_users):
        same_group = nodes[i]["group"] == nodes[j]["group"]
        p = density if same_group else density * 0.15
        if random.random() < p:
            edges.append({"source": i, "target": j, "type": "friend"})
            edge_set.add((i, j))

# You 的朋友邊：限制上限，越多用戶越難找到目標
you_added = 0
for j in range(1, num_users):
    if you_added >= max_you_friends:
        break
    same_group = nodes[0]["group"] == nodes[j]["group"]
    p = density if same_group else density * 0.15
    if random.random() < p:
        edges.append({"source": 0, "target": j, "type": "friend"})
        edge_set.add((0, j))
        you_added += 1

# 確保 You 至少有一個朋友（避免孤立無法遊玩）
if you_added == 0 and num_users > 1:
    edges.append({"source": 0, "target": 1, "type": "friend"})
    edge_set.add((0, 1))

# 確保每個非 You 節點至少有一條邊
for i in range(1, num_users):
    has_edge = any(
        e["type"] == "friend" and (e["source"] == i or e["target"] == i)
        for e in edges
    )
    if not has_edge:
        pool = [j for j in range(1, num_users)
                if j != i and nodes[j]["group"] == nodes[i]["group"]
                and (min(i,j), max(i,j)) not in edge_set]
        if not pool:
            pool = [j for j in range(1, num_users)
                    if j != i and (min(i,j), max(i,j)) not in edge_set]
        if pool:
            j = random.choice(pool)
            edges.append({"source": min(i,j), "target": max(i,j), "type": "friend"})
            edge_set.add((min(i,j), max(i,j)))

# BFS 找出從 You(0) 不可達的連通分量，各補一條橋接邊
reachable = set()
queue = [0]
adj_tmp = defaultdict(set)
for e in edges:
    if e["type"] == "friend":
        adj_tmp[e["source"]].add(e["target"])
        adj_tmp[e["target"]].add(e["source"])
while queue:
    cur = queue.pop()
    if cur in reachable: continue
    reachable.add(cur)
    queue.extend(adj_tmp[cur] - reachable)

for i in range(1, num_users):
    if i not in reachable:
        bridge_src = random.choice(list(reachable))
        pair = (min(bridge_src, i), max(bridge_src, i))
        if pair not in edge_set:
            edges.append({"source": pair[0], "target": pair[1], "type": "friend"})
            edge_set.add(pair)
            adj_tmp[pair[0]].add(pair[1])
            adj_tmp[pair[1]].add(pair[0])
        reachable.add(i)
        queue = list(adj_tmp[i] - reachable)
        while queue:
            cur = queue.pop()
            if cur in reachable: continue
            reachable.add(cur)
            queue.extend(adj_tmp[cur] - reachable)

# ── 計算 degree centrality ────────────────────────────
deg = defaultdict(int)
for e in edges:
    deg[e["source"]] += 1
    deg[e["target"]] += 1

# ── 三元閉包：找出「You」的推薦好友 ─────────────────
you_friends = set()
for e in edges:
    if e["source"] == 0:
        you_friends.add(e["target"])
    elif e["target"] == 0:
        you_friends.add(e["source"])

recommendations = set()
for friend_id in you_friends:
    for e in edges:
        src, tgt = e["source"], e["target"]
        if src == friend_id and tgt != 0 and tgt not in you_friends:
            recommendations.add(tgt)
        elif tgt == friend_id and src != 0 and src not in you_friends:
            recommendations.add(src)

# 推薦邊（虛線，type='recommend'）
for rec_id in recommendations:
    edges.append({"source": 0, "target": rec_id, "type": "recommend"})

# ── 更新節點的 degree 與 centrality ──────────────────
max_deg = max(deg.values(), default=1)
for n in nodes:
    n["degree"] = deg[n["id"]]
    n["centrality"] = round(deg[n["id"]] / max_deg, 2)

# ── 回傳 JSON（React 接收此值渲染 D3 圖形）────────────
json.dumps({
    "nodes": nodes,
    "edges": edges,
    "you_friends": list(you_friends),
    "recommendations": list(recommendations),
})
`,
    },
  },
];
