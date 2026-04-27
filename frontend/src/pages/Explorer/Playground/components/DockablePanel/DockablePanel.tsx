// frontend/src/pages/Explorer/components/DockablePanel/DockablePanel.tsx
import type { ReactNode } from "react";
import styles from "./DockablePanel.module.scss";

export type PanelId = "globalVars" | "localVars" | "callStack" | "console";

export interface PanelConfig {
  id: PanelId;
  label: string;
  icon: string; // font-awesome icon name
  accentVar: string; // CSS var name e.g. "--color-primary"
}

export const PANEL_CONFIGS: Record<PanelId, PanelConfig> = {
  globalVars: {
    id: "globalVars",
    label: "Global Vars",
    icon: "database",
    accentVar: "--color-primary",
  },
  localVars: {
    id: "localVars",
    label: "Local Vars",
    icon: "location-crosshairs",
    accentVar: "--color-accent",
  },
  callStack: {
    id: "callStack",
    label: "Call Stack",
    icon: "layer-group",
    accentVar: "--color-pink",
  },
  console: {
    id: "console",
    label: "Console",
    icon: "terminal",
    accentVar: "--color-teal",
  },
};

interface DockablePanelProps {
  id: PanelId;
  /** Optional sub-label appended to header, e.g. "· bubble_sort" */
  subLabel?: string;
  children: ReactNode;
}

export function DockablePanel({ id, subLabel, children }: DockablePanelProps) {
  const config = PANEL_CONFIGS[id];
  return (
    <div
      className={styles.panel}
      style={{ ["--accent" as string]: `var(${config.accentVar})` }}
    >
      <div className={styles.header}>
        <span className={styles.title}>
          <span className={styles.titleText}>{config.label}</span>
          {subLabel && <span className={styles.subLabel}>{subLabel}</span>}
        </span>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}

export default DockablePanel;
