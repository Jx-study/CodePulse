import type cytoscape from "cytoscape";
import type { CallGraph } from "@/types/trace";

const CG_COLORS = {
  nodeBg:       "#1e1e2e",
  nodeBorder:   "#6c6f93",
  nodeText:     "#cdd6f4",
  edgeLine:     "#585b70",
  edgeText:     "#a6adc8",
  activeEdge:   "#89b4fa",
  activeNode:   "#fffc5c",
  startNode:    "#a6e3a1",
  endNode:      "#f38ba8",
  startEndText: "#1e1e2e",
  returnActive: "#cba6f7",
} as const;

export const CALL_GRAPH_STYLESHEET: cytoscape.StylesheetStyle[] = [
  {
    selector: "node[label]",
    style: {
      label: "data(label)",
      "text-valign": "center",
      "text-halign": "center",
      "background-color": CG_COLORS.nodeBg,
      "border-color": CG_COLORS.nodeBorder,
      "border-width": 1,
      color: CG_COLORS.nodeText,
      "font-size": 12,
      "font-family": "monospace",
      width: "data(width)",
      height: "data(height)",
      shape: "roundrectangle",
    },
  },
  {
    selector: "node:active",
    style: { "overlay-opacity": 0 },
  },
  {
    selector: "edge[label]",
    style: {
      label: "data(label)",
      "curve-style": "bezier",
      "target-arrow-shape": "triangle",
      "line-color": CG_COLORS.edgeLine,
      "target-arrow-color": CG_COLORS.edgeLine,
      color: CG_COLORS.edgeText,
      "font-size": 11,
      "text-background-opacity": 1,
      "text-background-color": CG_COLORS.nodeBg,
      "text-background-padding": "2px",
    },
  },
  {
    selector: "edge.active",
    style: {
      "line-color": CG_COLORS.activeEdge,
      "target-arrow-color": CG_COLORS.activeEdge,
      "line-style": "solid",
      width: 2,
    },
  },
  {
    selector: "node.active",
    style: {
      "background-color": CG_COLORS.activeNode,
      "border-color": CG_COLORS.activeNode,
      "border-width": 2,
      color: CG_COLORS.startEndText,
    },
  },
  // START 節點（綠色）
  {
    selector: "node[kind = 'start']",
    style: {
      "background-color": CG_COLORS.startNode,
      "border-color": CG_COLORS.startNode,
      color: CG_COLORS.startEndText,
      "font-weight": "bold",
    },
  },
  // END 節點（紅色）
  {
    selector: "node[kind = 'end']",
    style: {
      "background-color": CG_COLORS.endNode,
      "border-color": CG_COLORS.endNode,
      color: CG_COLORS.startEndText,
      "font-weight": "bold",
    },
  },
  // 無 CFG 節點（半透明，不可點擊感）
  {
    selector: "node[kind = 'no-cfg']",
    style: { opacity: 0.5 },
  },
  // return 邊（虛線，預設低透明度）
  {
    selector: "edge[edgeType = 'return']",
    style: {
      "line-style": "dashed",
      "line-color": CG_COLORS.edgeLine,
      "target-arrow-color": CG_COLORS.edgeLine,
      opacity: 0.35,
    },
  },
  // return 邊 active（RETURN event 時高亮）
  {
    selector: "edge[edgeType = 'return'].active-return",
    style: {
      opacity: 1,
      "line-color": CG_COLORS.returnActive,
      "target-arrow-color": CG_COLORS.returnActive,
    },
  },
];

export const CALL_GRAPH_LAYOUT: cytoscape.LayoutOptions = {
  name: "dagre",
  rankDir: "TB",
  nodeSep: 60,
  rankSep: 80,
} as cytoscape.LayoutOptions;

export function buildCallGraphElements(
  callGraph: CallGraph,
  currentStep: number,
  cfgGraph: Record<string, unknown> = {},
): cytoscape.ElementDefinition[] {
  // root 永遠是 func_<global>（後端已保證）
  const rootId = callGraph.root || "func_<global>";

  // START 節點（綠，不可點擊）
  const startNode: cytoscape.ElementDefinition = {
    data: { id: "__start__", label: "START", kind: "start", width: 80, height: 36 },
  };

  // END 節點（紅，不可點擊）
  const endNode: cytoscape.ElementDefinition = {
    data: { id: "__end__", label: "END", kind: "end", width: 80, height: 36 },
  };

  // START → (global) 實線
  const startEdge: cytoscape.ElementDefinition = {
    data: {
      id: "__start__->root",
      source: "__start__",
      target: rootId,
      edgeType: "call",
    },
  };

  // (global) → END 實線
  const endEdge: cytoscape.ElementDefinition = {
    data: {
      id: "root->__end__",
      source: rootId,
      target: "__end__",
      edgeType: "call",
    },
  };

  // 用戶節點
  const nodes = callGraph.nodes.map((n) => {
    const isModule = n.funcName === "<module>";
    const hasCfg = isModule
      ? "<global>" in cfgGraph &&
        (cfgGraph["<global>"] as any)?.nodes?.length > 0
      : n.funcName in cfgGraph;
    const label = isModule ? "<global>" : n.funcName;
    const width = Math.max(80, label.length * 8 + 16);
    const height = Math.max(36, Math.ceil(label.length / 15) * 20 + 16);
    return {
      data: {
        id: n.id,
        label,
        kind: hasCfg ? "user" : "no-cfg",
        funcName: n.funcName,
        width,
        height,
      },
    };
  });

  // call edges（實線，active 時高亮）
  const callEdges = callGraph.edges.map((e) => ({
    data: {
      id: `${e.source}->${e.target}`,
      source: e.source,
      target: e.target,
      steps: e.steps,
      label: e.steps.length > 1 ? `×${e.steps.length}` : "",
      edgeType: "call",
    },
    classes: e.steps.includes(currentStep) ? "active" : "",
  }));

  // return edges（虛線，RETURN event 時 active-return class 顯示）
  const returnEdges = callGraph.edges
    .filter((e) => e.returnSteps && e.returnSteps.length > 0)
    .map((e) => ({
      data: {
        id: `${e.target}-return->${e.source}`,
        source: e.target,
        target: e.source,
        edgeType: "return",
        label: "",
      },
      classes: e.returnSteps.includes(currentStep) ? "active-return" : "",
    }));

  return [
    startNode,
    endNode,
    startEdge,
    endEdge,
    ...nodes,
    ...callEdges,
    ...returnEdges,
  ];
}
