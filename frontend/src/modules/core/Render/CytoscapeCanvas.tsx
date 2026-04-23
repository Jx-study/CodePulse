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
  activeElementIds?: string[];
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
  const hasUserInteractedRef = useRef(false);

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

    // Track user viewport interactions so data updates don't reset zoom/pan
    cy.on("zoom pan", () => {
      hasUserInteractedRef.current = true;
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
      hasUserInteractedRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hasLayoutRunRef = useRef(false);

  // Effect 2: data update — re-run layout only when structure changes (not class-only updates)
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const incoming = elements;
    const existing = cy.elements();

    // Check if structure changed (node/edge ids differ) vs class-only update
    const incomingIds = new Set(incoming.map((e) => e.data.id as string));
    const existingIds = new Set(existing.map((e) => e.id()));
    const structureChanged =
      !hasLayoutRunRef.current ||
      incomingIds.size !== existingIds.size ||
      [...incomingIds].some((id) => !existingIds.has(id));

    if (structureChanged) {
      cy.elements().remove();
      cy.add(incoming);
      cy.layout(layout).run();
      hasLayoutRunRef.current = true;
      if (!hasUserInteractedRef.current) {
        cy.fit();
        hasUserInteractedRef.current = true;
      }
    } else {
      // Only update classes without re-running layout
      cy.batch(() => {
        incoming.forEach((el) => {
          const id = el.data.id as string;
          const cyEl = cy.getElementById(id);
          cyEl.removeClass(cyEl.classes().join(" "));
          if (el.classes) cyEl.addClass(el.classes as string);
        });
      });
    }
  }, [elements, layout]);

  // Effect 3: stylesheet update — no layout
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.style(stylesheet).update();
  }, [stylesheet]);

  const handleReset = () => {
    hasUserInteractedRef.current = false;
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