import type cytoscape from "cytoscape";
import type { CallGraph } from "@/types/trace";

export const CALL_GRAPH_STYLESHEET: cytoscape.StylesheetStyle[] = [
  {
    selector: "node[label]",
    style: {
      label: "data(label)",
      "text-valign": "center",
      "text-halign": "center",
      "background-color": "#1e1e2e",
      "border-color": "#6c6f93",
      "border-width": 1,
      color: "#cdd6f4",
      "font-size": 12,
      "font-family": "monospace",
      width: 120,
      height: 40,
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
      "line-color": "#585b70",
      "target-arrow-color": "#585b70",
      color: "#a6adc8",
      "font-size": 11,
      "text-background-opacity": 1,
      "text-background-color": "#1e1e2e",
      "text-background-padding": "2px",
    },
  },
  {
    selector: "edge.active",
    style: {
      "line-color": "#89b4fa",
      "target-arrow-color": "#89b4fa",
      "line-style": "solid",
      width: 2,
    },
  },
  {
    selector: "node.active",
    style: {
      "border-color": "#f9e2af",
      "border-width": 2,
    },
  },
  // START 節點（綠色）
  {
    selector: "node[kind = 'start']",
    style: {
      "background-color": "#a6e3a1",
      "border-color": "#a6e3a1",
      color: "#1e1e2e",
      "font-weight": "bold",
    },
  },
  // END 節點（紅色）
  {
    selector: "node[kind = 'end']",
    style: {
      "background-color": "#f38ba8",
      "border-color": "#f38ba8",
      color: "#1e1e2e",
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
      "line-color": "#585b70",
      "target-arrow-color": "#585b70",
      opacity: 0.35,
    },
  },
  // return 邊 active（RETURN event 時高亮）
  {
    selector: "edge[edgeType = 'return'].active-return",
    style: {
      opacity: 1,
      "line-color": "#cba6f7",
      "target-arrow-color": "#cba6f7",
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
  // root 永遠是 func_<module>（後端 Task 1 已保證）
  const rootId = callGraph.root || "func_<module>";

  // START 節點（綠，不可點擊）
  const startNode: cytoscape.ElementDefinition = {
    data: { id: "__start__", label: "START", kind: "start" },
  };

  // END 節點（紅，不可點擊）
  const endNode: cytoscape.ElementDefinition = {
    data: { id: "__end__", label: "END", kind: "end" },
  };

  // START → (global) 實線
  const startEdge: cytoscape.ElementDefinition = {
    data: { id: "__start__->root", source: "__start__", target: rootId, edgeType: "call" },
  };

  // (global) → END 實線
  const endEdge: cytoscape.ElementDefinition = {
    data: { id: "root->__end__", source: rootId, target: "__end__", edgeType: "call" },
  };

  // 用戶節點
  const nodes = callGraph.nodes.map((n) => {
    const isModule = n.funcName === "<module>";
    const hasCfg = isModule
      ? "<module>" in cfgGraph && (cfgGraph["<module>"] as any)?.nodes?.length > 0
      : n.funcName in cfgGraph;
    return {
      data: {
        id: n.id,
        label: isModule ? "(global)" : n.funcName,
        kind: hasCfg ? "user" : "no-cfg",
        funcName: n.funcName,
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

  return [startNode, endNode, startEdge, endEdge, ...nodes, ...callEdges, ...returnEdges];
}
