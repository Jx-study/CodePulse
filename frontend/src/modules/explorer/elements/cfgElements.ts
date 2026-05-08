import type cytoscape from "cytoscape";
import type { CfgGraph } from "@/types/trace";

const CFG_COLORS = {
  nodeBg: "#1e1e2e",
  nodeBorder: "#6c6f93",
  nodeText: "#cdd6f4",
  edgeLine: "#585b70",
  edgeText: "#a6adc8",
  activeNode: "#ffe894",
  startNode: "#a6e3a1",
  endNode: "#f38ba8",
  darkText: "#1e1e2e",
  branchBorder: "#89b4fa",
  loopBorder: "#fab387",
  callBorder: "#cba6f7",
} as const;

const NODE_LINE_HEIGHT = 16;
const NODE_PADDING = 16;
const NODE_MIN_HEIGHT = 36;
const NODE_MIN_WIDTH = 80;
const NODE_CHAR_WIDTH = 7; // monospace font-size 11 approximation

const CFG_KIND_STYLES: Record<string, Partial<cytoscape.Css.Node>> = {
  entry:  { shape: "ellipse",   "background-color": CFG_COLORS.startNode, color: CFG_COLORS.darkText },
  exit:   { shape: "ellipse",   "background-color": CFG_COLORS.endNode,   color: CFG_COLORS.darkText },
  branch: { shape: "diamond",   "border-color": CFG_COLORS.branchBorder, "border-width": 2 },
  loop:   { shape: "rectangle", "border-color": CFG_COLORS.loopBorder,   "border-width": 2 },
  call:   { shape: "rectangle", "border-color": CFG_COLORS.callBorder,   "border-width": 2 },
  return: { shape: "rectangle", "border-color": CFG_COLORS.edgeLine },
  basic:  { shape: "rectangle" },
};

export const CFG_STYLESHEET: cytoscape.StylesheetStyle[] = [
  {
    selector: "node",
    style: {
      label: "data(label)",
      "text-valign": "center",
      "text-halign": "center",
      "background-color": CFG_COLORS.nodeBg,
      "border-color": CFG_COLORS.nodeBorder,
      "border-width": 1,
      color: CFG_COLORS.nodeText,
      "font-size": 11,
      "font-family": "monospace",
      "text-wrap": "wrap",
      "text-max-width": "300px",
      width: "data(width)",
      height: "data(height)",
      shape: "rectangle",
    },
  },
  ...Object.entries(CFG_KIND_STYLES).map(([kind, style]) => ({
    selector: `node[kind = "${kind}"]`,
    style: style as cytoscape.Css.Node,
  })),
  {
    selector: "node.active",
    style: {
      "border-color": CFG_COLORS.activeNode,
      "border-width": 3,
      "background-color": CFG_COLORS.activeNode,
      color: CFG_COLORS.darkText,
    },
  },
  {
    selector: "edge",
    style: {
      label: "data(label)",
      "curve-style": "bezier",
      "target-arrow-shape": "triangle",
      "line-color": CFG_COLORS.edgeLine,
      "target-arrow-color": CFG_COLORS.edgeLine,
      color: CFG_COLORS.edgeText,
      "font-size": 10,
      "text-background-opacity": 1,
      "text-background-color": CFG_COLORS.nodeBg,
      "text-background-padding": "2px",
    },
  },
  {
    selector: 'edge[label = "loop back"]',
    style: { "curve-style": "bezier", "control-point-step-size": 80 },
  },
  {
    selector: 'edge[label = "True"], edge[label = "False"]',
    style: { "line-style": "dashed" },
  },
  {
    selector: 'edge[label = "call"]',
    style: { "line-style": "dashed", "target-arrow-shape": "triangle" },
  },
];

export const CFG_LAYOUT: cytoscape.LayoutOptions = {
  name: "dagre",
  rankDir: "TB",
  nodeSep: 40,
  rankSep: 60,
} as cytoscape.LayoutOptions;

function nodeHeight(label: string): number {
  const lines = label.split("\n").length;
  return Math.max(NODE_MIN_HEIGHT, lines * NODE_LINE_HEIGHT + NODE_PADDING);
}

export function buildCfgElements(
  cfg: CfgGraph,
  activeLineno?: number,
): cytoscape.ElementDefinition[] {
  const nodes = cfg.nodes.map((n) => {
    const label = n.label || n.id;
    const longestLine = Math.max(...label.split("\n").map((l) => l.length));
    const width = Math.max(NODE_MIN_WIDTH, longestLine * NODE_CHAR_WIDTH + NODE_PADDING);
    return {
      data: {
        id: n.id,
        label,
        kind: n.kind,
        lines: n.lines,
        width,
        height: nodeHeight(label),
      },
      classes:
        activeLineno != null && n.lines.includes(activeLineno) ? "active" : "",
    };
  });
  const edges = cfg.edges.map((e) => ({
    data: {
      id: `${e.source}->${e.target}`,
      source: e.source,
      target: e.target,
      label: e.label,
    },
  }));
  return [...nodes, ...edges];
}
