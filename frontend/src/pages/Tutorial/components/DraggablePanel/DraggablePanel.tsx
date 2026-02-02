import { ReactNode, CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Panel, PanelImperativeHandle } from "react-resizable-panels";
import { PanelHeader } from "../PanelHeader/PanelHeader";
import styles from "./DraggablePanel.module.scss";

interface DraggablePanelProps {
  id: string;
  defaultSize?: number;
  minSize?: number | string;
  collapsible?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  children: ReactNode;
  header?: {
    title: string;
    icon?: ReactNode;
    collapsible?: boolean;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
  };
  draggable?: boolean;
  panelRef?: React.RefObject<PanelImperativeHandle | null>;
  onResize?: () => void;
  className?: string;
}

export function DraggablePanel({
  id,
  defaultSize,
  minSize,
  collapsible,
  onCollapse,
  children,
  header,
  draggable = false,
  panelRef,
  onResize,
  className = "",
}: DraggablePanelProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: !draggable,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : undefined,
  };

  return (
    <Panel
      defaultSize={defaultSize}
      minSize={minSize}
      collapsible={collapsible}
      panelRef={panelRef}
      onResize={onResize}
      className={`${styles.draggablePanel} ${className} ${isDragging ? styles.dragging : ""}`}
    >
      <div ref={setNodeRef} style={style} className={styles.panelWrapper}>
        {header && (
          <PanelHeader
            {...header}
            draggable={draggable}
            dragHandleProps={draggable ? { ...attributes, ...listeners } : undefined}
          />
        )}
        <div className={styles.panelContent}>{children}</div>
      </div>
    </Panel>
  );
}
