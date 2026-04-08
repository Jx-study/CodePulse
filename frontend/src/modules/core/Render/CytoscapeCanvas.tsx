import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import Button from "@/shared/components/Button";
import type { BaseCanvasProps } from "@/types/components/display";
import canvasStyles from "./canvas.module.scss";
import styles from "./CytoscapeCanvas.module.scss";

cytoscape.use(dagre);

export interface CytoscapeCanvasProps extends BaseCanvasProps {
  elements: cytoscape.ElementDefinition[];
  stylesheet: cytoscape.StylesheetStyle[];
  layout?: cytoscape.LayoutOptions;
  onNodeClick?: (nodeId: string) => void;
}

function CytoscapeCanvas({
  elements,
  stylesheet,
  layout = { name: "dagre", rankDir: "TB" } as cytoscape.LayoutOptions,
  onNodeClick,
  enableZoom = true,
  enablePan = true,
}: CytoscapeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const onNodeClickRef = useRef(onNodeClick);

  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  // Effect 1: mount/unmount cy instance
  useEffect(() => {
    if (!containerRef.current) return;
    const cy = cytoscape({
      container: containerRef.current,
      userZoomingEnabled: enableZoom,
      userPanningEnabled: enablePan,
      style: stylesheet,
    });
    cyRef.current = cy;

    if (onNodeClickRef.current) {
      cy.on("tap", "node", (e) => {
        onNodeClickRef.current?.(e.target.id());
      });
    }

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect 2: data update — re-run layout
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().remove();
    cy.add(elements);
    cy.layout(layout).run();
    cy.fit();
  }, [elements, layout]);

  // Effect 3: stylesheet update — no layout
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.style(stylesheet).update();
  }, [stylesheet]);

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

export default CytoscapeCanvas;