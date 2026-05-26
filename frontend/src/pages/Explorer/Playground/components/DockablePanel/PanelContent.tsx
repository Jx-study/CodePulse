import type { StdoutEvent } from "@/types/trace";
import type { PanelId } from "./DockablePanel";

interface PanelContentProps {
  id: PanelId;
  globalVars: Record<string, string>;
  localVars: Record<string, any>;
  callStack: string[];
  stdoutEvents: StdoutEvent[];
  currentStep: number;
}

export function PanelContent({
  id,
  globalVars,
  localVars,
  callStack,
  stdoutEvents,
  currentStep,
}: PanelContentProps) {
  if (id === "globalVars") {
    return Object.entries(globalVars).length === 0 ? (
      <span style={{ color: "var(--text-tertiary)" }}>—</span>
    ) : (
      <>
        {Object.entries(globalVars).map(([k, v]) => (
          <VarRow key={k} name={k} val={String(v)} />
        ))}
      </>
    );
  }
  if (id === "localVars") {
    return Object.entries(localVars).length === 0 ? (
      <span style={{ color: "var(--text-tertiary)" }}>—</span>
    ) : (
      <>
        {Object.entries(localVars).map(([k, v]) => (
          <VarRow key={k} name={k} val={String(v)} />
        ))}
      </>
    );
  }
  if (id === "callStack") {
    return callStack.length === 0 ? (
      <span style={{ color: "var(--text-tertiary)" }}>—</span>
    ) : (
      <>
        {[...callStack].reverse().map((fname, i) => (
          <div
            key={i}
            style={{
              borderLeft: `2px solid ${i === 0 ? "var(--color-primary)" : "var(--border)"}`,
              padding: "2px 6px 2px 8px",
              marginBottom: 3,
              fontFamily: "monospace",
              fontSize: 11,
              color: i === 0 ? "var(--text-primary)" : "var(--text-tertiary)",
            }}
          >
            {i === 0 && (
              <span style={{ color: "var(--color-primary)", marginRight: 4 }}>➔</span>
            )}
            {fname === "<module>" ? "(global)" : fname}
          </div>
        ))}
      </>
    );
  }
  if (id === "console") {
    const lines = stdoutEvents.filter((e) => e.step <= currentStep);
    return lines.length === 0 ? (
      <span style={{ color: "var(--text-tertiary)" }}>—</span>
    ) : (
      <>
        {lines.map((e, i) => (
          <div
            key={i}
            style={{
              fontFamily: "monospace",
              fontSize: 10.5,
              color: "var(--text-primary)",
              lineHeight: 1.7,
            }}
          >
            {e.text}
          </div>
        ))}
      </>
    );
  }
  return null;
}

function VarRow({ name, val }: { name: string; val: string }) {
  return (
    <div style={{ display: "flex", gap: 8, padding: "1px 0", fontSize: 11 }}>
      <span
        style={{
          color: "var(--color-primary)",
          flex: "0 0 80px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontFamily: "monospace",
        }}
      >
        {name}
      </span>
      <span style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}>
        {val}
      </span>
    </div>
  );
}
