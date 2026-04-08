import type cytoscape from "cytoscape";
import type { CfgGraph } from "@/types/trace";

const CFG_KIND_STYLES: Record<string, Partial<cytoscape.Css.Node>> = {
  entry:  { shape: "ellipse",   "background-color": "#a6e3a1", color: "#1e1e2e" },
  exit:   { shape: "ellipse",   "background-color": "#f38ba8", color: "#1e1e2e" },
  branch: { shape: "diamond",   "border-color": "#89b4fa", "border-width": 2 },
  loop:   { shape: "rectangle", "border-color": "#fab387", "border-width": 2 },
  call:   { shape: "rectangle", "border-color": "#cba6f7", "border-width": 2 },
  return: { shape: "rectangle", "border-color": "#585b70" },
  basic:  { shape: "rectangle" },
};

export const CFG_STYLESHEET: cytoscape.StylesheetStyle[] = [
  {
    selector: "node",
    style: {
      label: "data(label)",
      "text-valign": "center",
      "text-halign": "center",
      "background-color": "#1e1e2e",
      "border-color": "#6c6f93",
      "border-width": 1,
      color: "#cdd6f4",
      "font-size": 11,
      "font-family": "monospace",
      "text-wrap": "wrap",
      "text-max-width": "100px",
      width: 120,
      height: 40,
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
      "border-color": "#f9e2af",
      "border-width": 3,
      "background-color": "rgba(249, 226, 175, 0.1)",
    },
  },
  {
    selector: "edge",
    style: {
      label: "data(label)",
      "curve-style": "bezier",
      "target-arrow-shape": "triangle",
      "line-color": "#585b70",
      "target-arrow-color": "#585b70",
      color: "#a6adc8",
      "font-size": 10,
      "text-background-opacity": 1,
      "text-background-color": "#1e1e2e",
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

export function buildCfgElements(
  cfg: CfgGraph,
  activeLineno?: number,
): cytoscape.ElementDefinition[] {
  const nodes = cfg.nodes.map((n) => ({
    data: { id: n.id, label: n.label || n.id, kind: n.kind, lines: n.lines },
    classes:
      activeLineno != null && n.lines.includes(activeLineno) ? "active" : "",
  }));
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
