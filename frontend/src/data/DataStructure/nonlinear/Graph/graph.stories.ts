import type { RealWorldStory } from '@/types/implementation';

export const graphRealWorldStories: RealWorldStory[] = [
  {
    id: 'graph-social-network',
    video: {
      url: 'https://youtu.be/OlXfIFq-gDI',
      duration: '7:45',
    },
    resources: [
      { type: 'link', url: 'https://developers.facebook.com/docs/graph-api' },
      { type: 'article', url: 'https://www.puppygraph.com/blog/social-network-graphs#what-is-a-social-network-graph' },
    ],
    pythonDemo: {
      outputType: 'graph',
      inputs: [
        {
          variable: 'num_users',
          type: 'slider',
          default: 10,
          min: 6,
          max: 15,
          step: 1,
        },
        {
          variable: 'num_communities',
          type: 'slider',
          default: 3,
          min: 2,
          max: 4,
          step: 1,
        },
        {
          variable: 'density_slider',
          type: 'slider',
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

num_users       = globals().get('num_users', 10)
num_communities = globals().get('num_communities', 3)
density         = globals().get('density_slider', 5) / 15.0  # 1-9 → 0.07~0.6

NAMES = [
    "You", "Alice", "Bob", "Charlie", "Diana", "Eve",
    "Frank", "Grace", "Henry", "Iris", "Jack", "Karen",
    "Leo", "Mary", "Nick", "Olivia",
]
NAMES += [f"User{i}" for i in range(16, 30)]

random.seed(42)

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

max_you_friends = max(1, num_users // 5)

edges = []
edge_set = set()

for i in range(1, num_users):
    for j in range(i + 1, num_users):
        same_group = nodes[i]["group"] == nodes[j]["group"]
        p = density if same_group else density * 0.15
        if random.random() < p:
            edges.append({"source": i, "target": j, "type": "friend"})
            edge_set.add((i, j))

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

if you_added == 0 and num_users > 1:
    edges.append({"source": 0, "target": 1, "type": "friend"})
    edge_set.add((0, 1))

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

deg = defaultdict(int)
for e in edges:
    deg[e["source"]] += 1
    deg[e["target"]] += 1

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

for rec_id in recommendations:
    edges.append({"source": 0, "target": rec_id, "type": "recommend"})

max_deg = max(deg.values(), default=1)
for n in nodes:
    n["degree"] = deg[n["id"]]
    n["centrality"] = round(deg[n["id"]] / max_deg, 2)

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
