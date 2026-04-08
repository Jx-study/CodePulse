import { useState } from "react";
import EmptyState from "@/shared/components/EmptyState";
import Icon from "@/shared/components/Icon";
import CytoscapeCanvas from "@/modules/core/Render/CytoscapeCanvas";
import type { GenericTracePlayerProps } from "@/types/components/display";
import styles from "./GenericTracePlayer.module.scss";

type DrillState =
  | { mode: "call_graph" }
  | { mode: "cfg"; funcId: string };

function GenericTracePlayer({
  callGraph,
  currentStep,
  activeLineno,
}: GenericTracePlayerProps) {
  const [drill, setDrill] = useState<DrillState>({ mode: "call_graph" });

  if (!callGraph) {
    return (
      <EmptyState
        icon={<Icon name="circle-xmark" />}
        title="No graph data"
        description="Submit code to generate the call graph"
      />
    );
  }

  if (drill.mode === "cfg") {
    const node = callGraph.nodes.find((n) => n.id === drill.funcId);
    return (
      <div className={styles.player}>
        <div className={styles.cfgHeader}>
          <button
            className={styles.backBtn}
            onClick={() => setDrill({ mode: "call_graph" })}
          >
            <Icon name="chevron-left" />
            Call Graph
          </button>
          <span className={styles.cfgLabel}>
            CFG · {node?.funcName ?? drill.funcId}
          </span>
        </div>
        <div className={styles.graphArea}>
          <CytoscapeCanvas
            mode="cfg"
            cfg={node?.cfg ?? { nodes: [], edges: [] }}
            activeLineno={activeLineno}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.player}>
      <div className={styles.graphArea}>
        <CytoscapeCanvas
          mode="call_graph"
          callGraph={callGraph}
          currentStep={currentStep}
          onNodeClick={(funcId) => setDrill({ mode: "cfg", funcId })}
        />
      </div>
    </div>
  );
}

export default GenericTracePlayer;
