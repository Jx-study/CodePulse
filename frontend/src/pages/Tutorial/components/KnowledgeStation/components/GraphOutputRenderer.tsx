import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  drag as d3Drag,
  select as d3Select,
  zoom as d3Zoom,
  zoomIdentity,
} from 'd3';
import type { ZoomBehavior } from 'd3';
import type { GraphOutputData, GraphSimNode, GraphSimEdge } from '@/types/implementation';
import styles from './GraphOutputRenderer.module.scss';

const SVG_WIDTH = 580;
const SVG_HEIGHT = 420;
const YOU_COLOR = '#4F46E5';
const COMMUNITY_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
const nodeRadius = (d: GraphSimNode) => 8 + d.centrality * 14;

function getNodeFill(d: GraphSimNode): string {
  return d.id === 0 ? YOU_COLOR : COMMUNITY_COLORS[(d.group - 1) % COMMUNITY_COLORS.length];
}

type GameStatus = 'idle' | 'playing' | 'won';

interface GameState {
  status: GameStatus;
  targetId: number | null;
  knownIds: Set<number>;
  reachableIds: Set<number>;
  parents: Map<number, number>;
  operations: number;
  path: number[];
  startTime: number | null;
  elapsed: number;
}

interface LeaderboardEntry {
  rank: number;
  pathLength: number;
  operations: number;
  elapsed: number;
  pathNames: string[];
}

interface TooltipState {
  x: number;
  y: number;
  node: GraphSimNode;
}

interface Props {
  data: GraphOutputData;
}

function getEdgeEndId(x: number | GraphSimNode): number {
  return typeof x === 'object' ? x.id : x;
}

function buildAdjacency(edges: GraphSimEdge[]): Map<number, Set<number>> {
  const adj = new Map<number, Set<number>>();
  edges.forEach((e) => {
    if (e.type !== 'friend') return;
    const s = getEdgeEndId(e.source);
    const t = getEdgeEndId(e.target);
    if (!adj.has(s)) adj.set(s, new Set());
    if (!adj.has(t)) adj.set(t, new Set());
    adj.get(s)!.add(t);
    adj.get(t)!.add(s);
  });
  return adj;
}

function buildInitialGameState(
  data: GraphOutputData,
  adj: Map<number, Set<number>>,
  targetId: number | null,
): GameState {
  const knownIds = new Set([0, ...data.you_friends]);
  const parents = new Map<number, number>();
  data.you_friends.forEach((f) => parents.set(f, 0));

  const reachableIds = new Set<number>();
  knownIds.forEach((kid) => {
    (adj.get(kid) ?? new Set()).forEach((neighbor) => {
      if (!knownIds.has(neighbor)) {
        reachableIds.add(neighbor);
        if (!parents.has(neighbor)) {
          parents.set(neighbor, kid);
        }
      }
    });
  });

  return {
    status: 'idle',
    targetId,
    knownIds,
    reachableIds,
    parents,
    operations: 0,
    path: [],
    startTime: null,
    elapsed: 0,
  };
}

function reconstructPath(parents: Map<number, number>, targetId: number): number[] {
  const path: number[] = [targetId];
  let cur = targetId;
  while (parents.has(cur)) {
    cur = parents.get(cur)!;
    path.unshift(cur);
    if (cur === 0) break;
  }
  return path;
}

function visitNode(
  nodeId: number,
  state: GameState,
  adj: Map<number, Set<number>>,
  _data: GraphOutputData,
): GameState {
  const isFirstClick = state.status === 'idle';
  const newKnown = new Set(state.knownIds).add(nodeId);
  const newReachable = new Set(state.reachableIds);
  const newParents = new Map(state.parents);

  newReachable.delete(nodeId);

  (adj.get(nodeId) ?? new Set()).forEach((neighbor) => {
    if (!newKnown.has(neighbor) && !newReachable.has(neighbor)) {
      newReachable.add(neighbor);
      newParents.set(neighbor, nodeId);
    }
  });

  const newOps = state.operations + 1;
  const now = Date.now();

  if (nodeId === state.targetId) {
    const path = reconstructPath(newParents, nodeId);
    return {
      ...state,
      status: 'won',
      knownIds: newKnown,
      reachableIds: newReachable,
      parents: newParents,
      operations: newOps,
      path,
      startTime: state.startTime ?? now,
      elapsed: state.elapsed,
    };
  }

  return {
    ...state,
    status: 'playing',
    knownIds: newKnown,
    reachableIds: newReachable,
    parents: newParents,
    operations: newOps,
    startTime: isFirstClick ? now : state.startTime,
  };
}

function selectTarget(data: GraphOutputData, adj: Map<number, Set<number>>): number | null {
  const knownSet = new Set([0, ...data.you_friends]);

  // BFS 從整個初始已知集合出發（而非只從 You）
  const dist = new Map<number, number>();
  const queue: number[] = [];
  knownSet.forEach((id) => { dist.set(id, 0); queue.push(id); });

  while (queue.length > 0) {
    const cur = queue.shift()!;
    (adj.get(cur) ?? new Set()).forEach((n) => {
      if (!dist.has(n)) {
        dist.set(n, dist.get(cur)! + 1);
        queue.push(n);
      }
    });
  }

  const notKnown = (id: number) => !knownSet.has(id);

  // 優先：距已知集合 >= 2 步（需至少點擊 1 個中間節點才能到達）
  // 即「除非所有用戶都是朋友，否則目標至少間隔一個朋友」
  const preferred = [...dist.entries()]
    .filter(([id, d]) => notKnown(id) && d >= 2)
    .map(([id]) => id);

  // 退而求其次：直接可達但不在 known 的節點（d=1）
  const fallback = [...dist.entries()]
    .filter(([id, d]) => notKnown(id) && d >= 1)
    .map(([id]) => id);

  // 最後手段：任何不在 known 的節點（處理圖不連通的情況）
  const lastResort = data.nodes.filter((n) => !knownSet.has(n.id)).map((n) => n.id);

  const pool =
    preferred.length > 0 ? preferred :
    fallback.length > 0 ? fallback :
    lastResort;

  return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
}

function formatTime(ms: number): string {
  return `${Math.floor(ms / 1000)}.${String(ms % 1000).slice(0, 1)}s`;
}

const GraphOutputRenderer: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simulationRef = useRef<ReturnType<typeof forceSimulation<GraphSimNode>> | null>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const adjacency = useMemo(() => buildAdjacency(data.edges), [data.edges]);

  const [fixedTarget, setFixedTarget] = useState<number | null>(() =>
    selectTarget(data, adjacency)
  );

  const [gameState, setGameState] = useState<GameState>(() =>
    buildInitialGameState(data, adjacency, selectTarget(data, adjacency))
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    setLeaderboard([]);
    setElapsed(0);
    const adj = buildAdjacency(data.edges);
    const target = selectTarget(data, adj);
    setFixedTarget(target ?? null);
    setGameState(buildInitialGameState(data, adj, target ?? null));
  }, [data]);

  useEffect(() => {
    if (gameState.status === 'playing') {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => setElapsed((prev) => prev + 100), 100);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.status]);

  // 勝利時：寫入排行榜（僅在從非 won 切換到 won 時新增，避免 Strict Mode 重複寫入）
  const prevStatusRef = useRef<GameStatus>(gameState.status);
  useEffect(() => {
    if (gameState.status === 'won' && prevStatusRef.current !== 'won' && gameState.targetId !== null) {
      prevStatusRef.current = 'won';
      const newEntry: LeaderboardEntry = {
        rank: 0,
        pathLength: gameState.path.length - 1,
        operations: gameState.operations,
        elapsed,
        pathNames: gameState.path.map((id) => data.nodes.find((n) => n.id === id)?.name ?? `#${id}`),
      };
      setLeaderboard((prev) => {
        const updated = [...prev, newEntry]
          .sort((a, b) =>
            a.operations !== b.operations
              ? a.operations - b.operations
              : a.elapsed - b.elapsed
          )
          .map((e, i) => ({ ...e, rank: i + 1 }));
        return updated;
      });
    }
    if (gameState.status !== 'won') {
      prevStatusRef.current = gameState.status;
    }
  }, [gameState.status, gameState.targetId, gameState.path, gameState.operations, elapsed, data.nodes]);

  const handleResetZoom = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3Select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.transform, zoomIdentity);
  }, []);

  const handleNewGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setElapsed(0);
    handleResetZoom();
    setGameState(buildInitialGameState(data, adjacency, fixedTarget));
  }, [data, adjacency, fixedTarget, handleResetZoom]);

  const handleNodeClick = useCallback(
    (nodeId: number) => {
      if (gameState.status === 'won') return;
      if (!gameState.reachableIds.has(nodeId)) return;
      setGameState((prev) => visitNode(nodeId, prev, adjacency, data));
    },
    [gameState.status, gameState.reachableIds, adjacency, data]
  );

  // Effect 1：data 變更 → 重建 D3 simulation
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3Select(svgRef.current);
    svg.selectAll('*').remove();

    // ── Zoom + Pan（D3 zoom 套用在 SVG，transform 作用於 mainGroup）──
    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3.0])
      .filter((event: Event) => {
        // 滾輪縮放：永遠允許；拖曳平移：只在非節點圓形上觸發
        const target = event.target as Element;
        return event.type === 'wheel' || !target.closest('circle');
      })
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform.toString());
      });

    svg.call(zoomBehavior);
    zoomBehaviorRef.current = zoomBehavior;

    const mainGroup = svg.append('g').attr('class', 'main-group');

    const nodes: GraphSimNode[] = data.nodes.map((n) => ({ ...n }));
    const edges: GraphSimEdge[] = data.edges.map((e) => ({ ...e }));

    const simulation = forceSimulation<GraphSimNode>(nodes)
      .force(
        'link',
        forceLink<GraphSimNode, GraphSimEdge>(edges).id((d) => d.id).distance(90).strength(0.5)
      )
      .force('charge', forceManyBody().strength(-220))
      .force('center', forceCenter(SVG_WIDTH / 2, SVG_HEIGHT / 2))
      .force('collide', forceCollide<GraphSimNode>((d) => nodeRadius(d) + 6));

    simulationRef.current = simulation;

    const linkG = mainGroup.append('g').attr('class', 'links');
    const linkSel = linkG
      .selectAll<SVGLineElement, GraphSimEdge>('line')
      .data(edges)
      .join('line');

    // rings 層（pulse，在 links 之後、nodes 之前）
    const ringsG = mainGroup.append('g').attr('class', 'rings');
    const ringSel = ringsG
      .selectAll<SVGCircleElement, GraphSimNode>('circle')
      .data(nodes)
      .join('circle')
      .attr('class', styles.pulseRing)
      .attr('r', (d) => nodeRadius(d) + 8)
      .attr('opacity', 0)
      .style('animation', 'none');

    const nodeG = mainGroup.append('g').attr('class', 'nodes');
    const nodeSel = nodeG
      .selectAll<SVGCircleElement, GraphSimNode>('circle')
      .data(nodes)
      .join('circle')
      .attr('r', nodeRadius)
      .attr('fill', getNodeFill)
      .style('cursor', 'grab');

    const labelG = mainGroup.append('g').attr('class', 'labels');
    const labelSel = labelG
      .selectAll<SVGTextElement, GraphSimNode>('text')
      .data(nodes)
      .join('text')
      .attr('font-size', 11)
      .attr('font-family', 'inherit')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => -(nodeRadius(d) + 5))
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    const dragBehavior = d3Drag<SVGCircleElement, GraphSimNode>()
      .on('start', (event) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
    nodeSel.call(dragBehavior);

    nodeSel
      .on('mouseover', (event: MouseEvent, d: GraphSimNode) => {
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          node: d,
        });
      })
      .on('mousemove', (event: MouseEvent) => {
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip((prev) =>
          prev ? { ...prev, x: event.clientX - rect.left, y: event.clientY - rect.top } : null
        );
      })
      .on('mouseout', () => setTooltip(null))
      .on('click', (event: MouseEvent, d: GraphSimNode) => {
        event.stopPropagation();
        handleNodeClickRef.current(d.id);
      });

    simulation.on('tick', () => {
      linkSel
        .attr('x1', (d) => ((d.source as GraphSimNode).x ?? 0))
        .attr('y1', (d) => ((d.source as GraphSimNode).y ?? 0))
        .attr('x2', (d) => ((d.target as GraphSimNode).x ?? 0))
        .attr('y2', (d) => ((d.target as GraphSimNode).y ?? 0));

      nodeSel.attr('cx', (d) => d.x ?? 0).attr('cy', (d) => d.y ?? 0);

      ringSel.attr('cx', (d) => d.x ?? 0).attr('cy', (d) => d.y ?? 0);

      labelSel.attr('x', (d) => d.x ?? 0).attr('y', (d) => d.y ?? 0);
    });

    return () => {
      simulation.stop();
    };
  }, [data]);

  // Effect 2：gameState 變更 → imperative 樣式更新
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3Select(svgRef.current);
    const { status, knownIds, reachableIds, targetId, path } = gameState;

    const getNodeState = (d: GraphSimNode) => {
      if (d.id === 0) return 'you';
      if (status === 'won' && path.includes(d.id)) return 'path';
      if (status === 'won' && d.id === targetId) return 'won-target';
      if (knownIds.has(d.id)) return 'friend';
      if (d.id === targetId && reachableIds.has(d.id)) return 'target-reachable';
      if (d.id === targetId) return 'target-unreachable';
      if (reachableIds.has(d.id)) return 'reachable';
      return 'unreachable';
    };

    type NodeStyleConfig = {
      fill: string | ((d: GraphSimNode) => string);
      stroke: string;
      strokeWidth: number;
      opacity: number;
      cursor: string;
    };
    const nodeStyles: Record<string, NodeStyleConfig> = {
      you: { fill: '#4F46E5', stroke: '#fff', strokeWidth: 2, opacity: 1, cursor: 'default' },
      friend: { fill: getNodeFill, stroke: '#4F46E5', strokeWidth: 3, opacity: 1, cursor: 'default' },
      reachable: { fill: getNodeFill, stroke: '#FBBF24', strokeWidth: 2.5, opacity: 0.9, cursor: 'pointer' },
      'target-reachable': { fill: getNodeFill, stroke: '#F97316', strokeWidth: 3, opacity: 1, cursor: 'pointer' },
      'target-unreachable': { fill: getNodeFill, stroke: '#D97706', strokeWidth: 2.5, opacity: 0.55, cursor: 'default' },
      unreachable: { fill: '#374151', stroke: '#4B5563', strokeWidth: 1, opacity: 0.25, cursor: 'default' },
      'won-target': { fill: '#10B981', stroke: '#34D399', strokeWidth: 3, opacity: 1, cursor: 'default' },
      path: { fill: getNodeFill, stroke: '#10B981', strokeWidth: 3, opacity: 1, cursor: 'default' },
    };

    svg.selectAll<SVGCircleElement, GraphSimNode>('.nodes circle').each(function (d) {
      const s = getNodeState(d);
      const cfg = nodeStyles[s];
      if (!cfg) return;
      const fill = typeof cfg.fill === 'function' ? cfg.fill(d) : cfg.fill;
      d3Select(this)
        .attr('fill', fill)
        .attr('stroke', cfg.stroke)
        .attr('stroke-width', cfg.strokeWidth)
        .attr('opacity', cfg.opacity)
        .style('cursor', cfg.cursor);
    });

    svg.selectAll<SVGCircleElement, GraphSimNode>('.rings circle').each(function (d) {
      const s = getNodeState(d);
      const show = s === 'reachable' || s === 'target-reachable';
      const stroke = d.id === targetId ? '#F97316' : '#FBBF24';
      const el = d3Select(this).attr('opacity', show ? 1 : 0).attr('stroke', stroke);
      if (show) el.style('animation', null);
      else el.style('animation', 'none');
    });

    svg.selectAll<SVGLineElement, GraphSimEdge>('.links line').each(function (d) {
      if (d.type === 'recommend') return;
      const src = typeof d.source === 'object' ? (d.source as GraphSimNode).id : (d.source as number);
      const tgt = typeof d.target === 'object' ? (d.target as GraphSimNode).id : (d.target as number);
      const isPathEdge =
        status === 'won' &&
        path.includes(src) &&
        path.includes(tgt) &&
        Math.abs(path.indexOf(src) - path.indexOf(tgt)) === 1;
      const srcKnown = knownIds.has(src);
      const tgtKnown = knownIds.has(tgt);
      const isYouFriendEdge =
        (src === 0 && knownIds.has(tgt)) || (tgt === 0 && knownIds.has(src));

      let stroke = '#4B5563';
      let strokeOpacity = 0.30;
      let strokeWidth = 1;
      let strokeDasharray: string | null = null;

      if (isPathEdge) {
        stroke = '#10B981';
        strokeOpacity = 1;
        strokeWidth = 3;
      } else if (isYouFriendEdge) {
        stroke = '#4F46E5';
        strokeOpacity = 0.6;
        strokeWidth = 2.5;
      } else if (srcKnown && tgtKnown) {
        stroke = '#6B7280';
        strokeOpacity = 0.5;
        strokeWidth = 1.5;
      } else if (srcKnown || tgtKnown) {
        stroke = '#FBBF24';
        strokeOpacity = 0.5;
        strokeWidth = 1;
        strokeDasharray = '4,3';
      }

      d3Select(this)
        .attr('stroke', stroke)
        .attr('stroke-opacity', strokeOpacity)
        .attr('stroke-width', strokeWidth)
        .attr('stroke-dasharray', strokeDasharray);
    });

    svg.selectAll<SVGLineElement, GraphSimEdge>('.links line').each(function (d) {
      if (d.type === 'recommend') {
        d3Select(this)
          .attr('stroke', '#F97316')
          .attr('stroke-opacity', 0.5)
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '5,3');
      }
    });

    svg.selectAll<SVGTextElement, GraphSimNode>('.labels text')
      .text((d) => (d.id === targetId ? `★ ${d.name}` : d.name))
      .attr('fill', (d) => (d.id === targetId ? '#FBBF24' : '#E5E7EB'))
      .attr('font-weight', (d) => (d.id === targetId ? '700' : '400'));
  }, [gameState, data]);

  const handleNodeClickRef = useRef(handleNodeClick);
  handleNodeClickRef.current = handleNodeClick;

  const maxGroup = useMemo(() => data.nodes.reduce((m, n) => Math.max(m, n.group), 0), [data.nodes]);

  const targetName = gameState.targetId !== null
    ? data.nodes.find((n) => n.id === gameState.targetId)?.name
    : null;

  const isReachable = tooltip ? gameState.reachableIds.has(tooltip.node.id) : false;

  return (
    <div className={styles.wrapper}>
      <div className={styles.purpose}>
        <div className={styles.purposeTitle}>🌐 六度分隔遊戲 — Facebook 社交圖譜模擬</div>
        <div className={styles.purposeBody}>
          <p>
            節點 = 用戶，邊 = 好友關係。<strong>節點大小</strong>
            代表朋友數（程度中心性），<strong>顏色</strong>代表社群分群。
          </p>
          <p>
            <span className={styles.badge} style={{ background: '#4F46E5' }} />
            藍框 = 你的直接好友（已認識）　
            <span className={styles.badge} style={{ background: '#FBBF24' }} />
            金框閃爍 = 可點擊認識　
            <span className={styles.badge} style={{ background: '#F97316' }} />
            橙虛線 = 三元閉包推薦
          </p>
          <p>
            目標：以<strong>最少步數</strong>認識 ★ 目標用戶。點擊閃爍節點開始！
          </p>
        </div>
      </div>

      <div className={styles.gameHeader}>
        <div className={styles.gameTarget}>
          {gameState.targetId !== null ? (
            <>
              目標：<span className={styles.targetName}>★ {targetName}</span>
            </>
          ) : (
            <span>無可用目標（請增加用戶數量）</span>
          )}
        </div>
        <div className={styles.gameStats}>
          <span>
            操作數：<strong>{gameState.operations}</strong>
          </span>
          <span>⏱ {formatTime(elapsed)}</span>
        </div>
        <button
          className={styles.newGameBtn}
          onClick={handleNewGame}
          disabled={gameState.status === 'playing'}
          title={gameState.status === 'playing' ? '遊戲進行中，請先完成或放棄' : '重新開始'}
        >
          New Game
        </button>
      </div>

      <div className={styles.svgContainer}>
        <svg
          ref={svgRef}
          className={styles.svg}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
        />
        <button
          className={styles.resetViewBtn}
          onClick={handleResetZoom}
          title="重置視圖 (滾輪縮放 / 拖曳平移)"
        >
          重置試圖
        </button>
        {tooltip && (
          <div
            className={styles.tooltip}
            style={{ left: tooltip.x + 14, top: tooltip.y - 14 }}
          >
            <span className={styles.tooltipName}>{tooltip.node.name}</span>
            <span>朋友數：{tooltip.node.degree}</span>
            <span>中心性：{tooltip.node.centrality.toFixed(2)}</span>
            {isReachable && <span className={styles.tooltipHint}>點擊認識</span>}
          </div>
        )}
      </div>

      {gameState.status === 'won' && gameState.targetId !== null && (
        <div className={styles.winCard}>
          <div className={styles.winTitle}>
            🎉 你在 {gameState.path.length - 1} 步內認識了 {targetName}！
          </div>
          <div className={styles.winPath}>
            路徑：{gameState.path.map((id) => data.nodes.find((n) => n.id === id)?.name).join(' → ')}
          </div>
          <div className={styles.winStats}>
            <span>
              路徑長度：<strong>{gameState.path.length - 1} 步</strong>
            </span>
            <span>
              操作數：<strong>{gameState.operations}</strong>
            </span>
            <span>
              耗時：<strong>{formatTime(elapsed)}</strong>
            </span>
          </div>
        </div>
      )}

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: YOU_COLOR }} />
          <span>You</span>
        </div>
        {Array.from({ length: maxGroup }, (_, i) => (
          <div key={i} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: COMMUNITY_COLORS[i % COMMUNITY_COLORS.length] }}
            />
            <span>社群 {i + 1}</span>
          </div>
        ))}
        <div className={styles.legendDivider} />
        <div className={styles.legendItem}>
          <span className={styles.legendLine} />
          <span>朋友</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDashed} />
          <span>推薦好友</span>
        </div>
      </div>

      {leaderboard.length > 0 && (
        <div className={styles.leaderboard}>
          <div className={styles.leaderboardTitle}>📊 本局排行榜</div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>操作數</th>
                <th>耗時</th>
                <th>路徑</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => (
                <tr key={i} className={i === 0 ? styles.rowBest : ''}>
                  <td>{entry.rank}</td>
                  <td>{entry.operations}</td>
                  <td>{formatTime(entry.elapsed)}</td>
                  <td className={styles.pathCell}>{entry.pathNames.join(' → ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GraphOutputRenderer;
