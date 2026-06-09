// frontend/src/pages/Explorer/components/DockablePanel/DockablePanel.tsx
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
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
    label: "panel.globalVars",
    icon: "database",
    accentVar: "--color-primary",
  },
  localVars: {
    id: "localVars",
    label: "panel.localVars",
    icon: "location-crosshairs",
    accentVar: "--color-accent",
  },
  callStack: {
    id: "callStack",
    label: "panel.callStack",
    icon: "layer-group",
    accentVar: "--color-pink",
  },
  console: {
    id: "console",
    label: "panel.console",
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
  const { t } = useTranslation("playground");
  const config = PANEL_CONFIGS[id];
  return (
    <div
      className={styles.panel}
      style={{ ["--accent" as string]: `var(${config.accentVar})` }}
    >
      <div className={styles.header}>
        <span className={styles.title}>
          <span className={styles.titleText}>{t(config.label)}</span>
          {subLabel && <span className={styles.subLabel}>{subLabel}</span>}
        </span>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}

export default DockablePanel;
