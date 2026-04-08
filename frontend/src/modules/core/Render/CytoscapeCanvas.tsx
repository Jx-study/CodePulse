import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import Button from "@/shared/components/Button";
import type {
  CytoscapeCanvasProps,
  CytoscapeCallGraphCanvasProps,
  CytoscapeCfgCanvasProps,
} from "@/types/components/display";
import type { CallGraph, CfgGraph } from "@/types/trace";
import canvasStyles from "./canvas.module.scss";
import styles from "./CytoscapeCanvas.module.scss";

cytoscape.use(dagre);

// Entry point 

function CytoscapeCanvas(props: CytoscapeCanvasProps) {
  if (props.mode === "call_graph") {
    return <CallGraphCytoscape {...props} />;
  }
  return <CfgCytoscape {...props} />;
}

export default CytoscapeCanvas;

// Call Graph 

function buildCallGraphElements(callGraph: CallGraph): cytoscape.ElementDefinition[] {
  const nodes = callGraph.nodes.map((n) => ({
    data: { id: n.id, label: n.funcName },
  }));
  const edges = callGraph.edges.map((e) => ({
    data: {
      id: `${e.source}->${e.target}`,
      source: e.source,
      target: e.target,
      steps: e.steps,
      label: e.steps.length > 1 ? `×${e.steps.length}` : "",
    },
  }));
  return [...nodes, ...edges];
}

function CallGraphCytoscape({
  callGraph,
  currentStep,
  onNodeClick,
  enableZoom = true,
  enablePan = true,
}: CytoscapeCallGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const onNodeClickRef = useRef(onNodeClick);

  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  // Effect 1: 建立 cy 實例（只執行一次）
  useEffect(() => {
    if (!containerRef.current) return;
    const cy = cytoscape({
      container: containerRef.current,
      userZoomingEnabled: enableZoom,
      userPanningEnabled: enablePan,
      style: [
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
      ],
    });
    cyRef.current = cy;

    cy.on("tap", "node", (e) => {
      onNodeClickRef.current(e.target.id());
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect 2: 資料更新（重跑 layout）
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().remove();
    cy.add(buildCallGraphElements(callGraph));
    cy.layout({ name: "dagre", rankDir: "TB", nodeSep: 60, rankSep: 80 } as cytoscape.LayoutOptions).run();
    cy.fit();
  }, [callGraph]);

  // Effect 3: 樣式更新（不跑 layout）
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.edges().removeClass("active");
    cy.edges().forEach((edge) => {
      const steps: number[] = edge.data("steps") ?? [];
      if (steps.includes(currentStep)) {
        edge.addClass("active");
      }
    });
  }, [currentStep]);

  const handleReset = () => {
    cyRef.current?.fit();
    cyRef.current?.center();
  };

  return (
    <div className={styles.container}>
      <div ref={containerRef} className={styles.cytoscape} />
      {(enableZoom || enablePan) && (
        <div className={canvasStyles.resetButtonContainer}>
          <Button
            variant="icon"
            size="sm"
            onClick={handleReset}
            aria-label="重置視圖"
            className={canvasStyles.resetButton}
            icon="rotate-right"
            iconOnly
          />
        </div>
      )}
    </div>
  );
}

// CFG

const CFG_NODE_STYLES: Record<string, Partial<cytoscape.Css.Node>> = {
  entry:  { shape: "ellipse",   "background-color": "#a6e3a1", color: "#1e1e2e" },
  exit:   { shape: "ellipse",   "background-color": "#f38ba8", color: "#1e1e2e" },
  branch: { shape: "diamond",   "border-color": "#89b4fa", "border-width": 2 },
  loop:   { shape: "rectangle", "border-color": "#fab387", "border-width": 2 },
  call:   { shape: "rectangle", "border-color": "#cba6f7", "border-width": 2 },
  return: { shape: "rectangle", "border-color": "#585b70" },
  basic:  { shape: "rectangle" },
};

function buildCfgElements(cfg: CfgGraph): cytoscape.ElementDefinition[] {
  const nodes = cfg.nodes.map((n) => ({
    data: {
      id: n.id,
      label: n.label || n.id,
      kind: n.kind,
      lines: n.lines,
    },
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

function CfgCytoscape({
  cfg,
  activeLineno,
  enableZoom = true,
  enablePan = true,
}: CytoscapeCfgCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // Effect 1: 建立 cy 實例（只執行一次）
  useEffect(() => {
    if (!containerRef.current) return;

    const kindStyles: cytoscape.StylesheetStyle[] = Object.entries(CFG_NODE_STYLES).map(
      ([kind, style]) => ({
        selector: `node[kind = "${kind}"]`,
        style: style as cytoscape.Css.Node,
      })
    );

    const cy = cytoscape({
      container: containerRef.current,
      userZoomingEnabled: enableZoom,
      userPanningEnabled: enablePan,
      style: [
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
        ...kindStyles,
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
          style: {
            "curve-style": "bezier",
            "control-point-step-size": 80,
          },
        },
        {
          selector: 'edge[label = "True"], edge[label = "False"]',
          style: { "line-style": "dashed" },
        },
        {
          selector: 'edge[label = "call"]',
          style: {
            "line-style": "dashed",
            "target-arrow-shape": "triangle",
          },
        },
      ],
    });
    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect 2: 資料更新（重跑 layout）
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().remove();
    cy.add(buildCfgElements(cfg));
    cy.layout({
      name: "dagre",
      rankDir: "TB",
      nodeSep: 40,
      rankSep: 60,
    } as cytoscape.LayoutOptions).run();
    cy.fit();
  }, [cfg]);

  // Effect 3: 樣式更新（不跑 layout）
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.nodes().removeClass("active");
    if (activeLineno != null) {
      cy.nodes().forEach((node) => {
        const lines: number[] = node.data("lines") ?? [];
        if (lines.includes(activeLineno)) {
          node.addClass("active");
        }
      });
    }
  }, [activeLineno]);

  const handleReset = () => {
    cyRef.current?.fit();
    cyRef.current?.center();
  };

  return (
    <div className={styles.container}>
      <div ref={containerRef} className={styles.cytoscape} />
      {(enableZoom || enablePan) && (
        <div className={canvasStyles.resetButtonContainer}>
          <Button
            variant="icon"
            size="sm"
            onClick={handleReset}
            aria-label="重置視圖"
            className={canvasStyles.resetButton}
            icon="rotate-right"
            iconOnly
          />
        </div>
      )}
    </div>
  );
}