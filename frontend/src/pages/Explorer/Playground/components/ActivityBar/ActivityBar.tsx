// frontend/src/pages/Explorer/components/ActivityBar/ActivityBar.tsx
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Button from "@/shared/components/Button";
import type { PanelId } from "../DockablePanel";
import { PANEL_CONFIGS } from "../DockablePanel";
import styles from "./ActivityBar.module.scss";

// ─── Sortable icon for the right bar ────────────────────────────────────────
interface SortableIconProps {
  panelId: PanelId;
  isActive: boolean; // not collapsed
  onClick: () => void;
}

export function SortableIcon({ panelId, isActive, onClick }: SortableIconProps) {
  const config = PANEL_CONFIGS[panelId];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: panelId,
    data: { panelId },
  });

  return (
    <Button
      variant="unstyled"
      iconOnly
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        ["--panel-accent" as string]: `var(${config.accentVar})`,
      }}
      className={`${styles.icon} ${isActive ? styles.iconActive : ""} ${isDragging ? styles.iconDragging : ""}`}
      onClick={onClick}
      title={config.label}
      icon={config.icon}
    />
  );
}

// ─── Draggable icon for the left bar docked slot ─────────────────────────────
interface DraggableDockedIconProps {
  panelId: PanelId;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function DraggableDockedIcon({
  panelId,
  isCollapsed,
  onToggleCollapse,
}: DraggableDockedIconProps) {
  const config = PANEL_CONFIGS[panelId];
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: panelId,
    data: { panelId },
  });

  return (
    <Button
      variant="unstyled"
      iconOnly
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`${styles.icon} ${!isCollapsed ? styles.iconActive : ""} ${isDragging ? styles.iconDragging : ""}`}
      style={{ ["--panel-accent" as string]: `var(${config.accentVar})` }}
      onClick={onToggleCollapse}
      title={`${config.label} (docked — drag to right bar to undock)`}
      icon={config.icon}
    />
  );
}

// ─── Left bar drop zone ───────────────────────────────────────────────────────
interface LeftDropZoneProps {
  isVisible: boolean;
}

export function LeftDropZone({ isVisible }: LeftDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "left-drop-zone" });
  if (!isVisible) return null;
  return (
    <div
      ref={setNodeRef}
      className={`${styles.dropZone} ${isOver ? styles.dropZoneOver : ""}`}
    />
  );
}

// ─── Left Activity Bar ────────────────────────────────────────────────────────
interface LeftActivityBarProps {
  isEditorOpen: boolean;
  onToggleEditor: () => void;
  leftDockedId: PanelId | null;
  collapsedPanels: Set<PanelId>;
  onToggleCollapse: (id: PanelId) => void;
  isDragActive: boolean;
}

export function LeftActivityBar({
  isEditorOpen,
  onToggleEditor,
  leftDockedId,
  collapsedPanels,
  onToggleCollapse,
  isDragActive,
}: LeftActivityBarProps) {
  return (
    <div className={styles.bar}>
      {/* CodeEditor icon — fixed, click = toggle editor open */}
      <Button
        variant="unstyled"
        className={`${styles.icon} ${styles.iconFixed} ${isEditorOpen ? styles.iconFixedActive : ""}`}
        onClick={onToggleEditor}
        title="Code Editor"
        aria-label="Code Editor"
        iconOnly
        icon="code"
      />

      <div className={styles.divider} />

      {/* Docked panel icon — draggable back to right bar */}
      {leftDockedId && (
        <DraggableDockedIcon
          panelId={leftDockedId}
          isCollapsed={collapsedPanels.has(leftDockedId)}
          onToggleCollapse={() => onToggleCollapse(leftDockedId)}
        />
      )}

      {/* Drop zone — visible when dragging AND left slot is empty */}
      <LeftDropZone isVisible={isDragActive && leftDockedId === null} />

      <div className={styles.spacer} />
    </div>
  );
}

// ─── Right Activity Bar ───────────────────────────────────────────────────────
interface RightActivityBarProps {
  rightOrder: PanelId[];
  leftDockedId: PanelId | null;
  collapsedPanels: Set<PanelId>;
  isDragActive: boolean;
  onTogglePanel: (id: PanelId) => void;
}

export function RightActivityBar({
  rightOrder,
  leftDockedId,
  collapsedPanels,
  onTogglePanel,
}: RightActivityBarProps) {
  const displayIds = rightOrder.filter((id) => id !== leftDockedId);
  return (
    <div className={`${styles.bar} ${styles.barRight}`}>
      {displayIds.map((id) => (
        <SortableIcon
          key={id}
          panelId={id}
          isActive={!collapsedPanels.has(id)}
          onClick={() => onTogglePanel(id)}
        />
      ))}
      <div className={styles.spacer} />
    </div>
  );
}
