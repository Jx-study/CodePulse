import type cytoscape from "cytoscape";
import type { CallGraph } from "@/types/trace";

export const CALL_GRAPH_STYLESHEET: cytoscape.StylesheetStyle[] = [
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
    selector: "edge",
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
): cytoscape.ElementDefinition[] {
  const nodes = callGraph.nodes.map((n) => ({
    data: {
      id: n.id,
      label: n.funcName === "<module>" ? "(global)" : n.funcName,
    },
  }));
  const edges = callGraph.edges.map((e) => ({
    data: {
      id: `${e.source}->${e.target}`,
      source: e.source,
      target: e.target,
      steps: e.steps,
      label: e.steps.length > 1 ? `×${e.steps.length}` : "",
    },
    classes: e.steps.includes(currentStep) ? "active" : "",
  }));
  return [...nodes, ...edges];
}
