import { useDroppable, useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import type { PanelId } from "../DockablePanel";
import { PANEL_CONFIGS } from "../DockablePanel";
import styles from "./ActivityBar.module.scss";

// Sortable icon for the right bar
interface SortableIconProps {
  panelId: PanelId;
  isActive: boolean; // not collapsed
  onClick: () => void;
  /** When provided, attached to the button DOM element for tour spotlight targeting */
  tourAttr?: string;
}

export function SortableIcon({ panelId, isActive, onClick, tourAttr }: SortableIconProps) {
  const { t } = useTranslation("playground");
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
      title={t(`panel.${panelId}`)}
      icon={config.icon}
      {...(tourAttr ? { "data-tour": tourAttr } : {})}
    />
  );
}

// Draggable icon for the left bar docked slot
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
  const { t } = useTranslation("playground");
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
      title={`${t(`panel.${panelId}`)} ${t("activityBar.dockedHint")}`}
      icon={config.icon}
    />
  );
}

// Left bar drop zone
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

// Left Activity Bar
interface LeftActivityBarProps {
  isEditorOpen: boolean;
  onToggleEditor: () => void;
  leftDockedId: PanelId | null;
  collapsedPanels: Set<PanelId>;
  onToggleCollapse: (id: PanelId) => void;
  isDragActive: boolean;
  isHistoryOpen: boolean;
  onOpenHistory: () => void;
  onOpenTour: () => void;
}

export function LeftActivityBar({
  isEditorOpen,
  onToggleEditor,
  leftDockedId,
  collapsedPanels,
  onToggleCollapse,
  isDragActive,
  isHistoryOpen,
  onOpenHistory,
  onOpenTour,
}: LeftActivityBarProps) {
  const { t } = useTranslation("playground");
  return (
    <div className={styles.bar} data-tour="pg-left-bar">
      {/* CodeEditor icon — fixed, click = toggle editor open */}
      <Button
        variant="unstyled"
        className={`${styles.icon} ${styles.iconFixed} ${isEditorOpen ? styles.iconFixedActive : ""}`}
        onClick={onToggleEditor}
        title={t("activityBar.codeEditor")}
        aria-label={t("activityBar.codeEditor")}
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

      {/* Execution history — bottom-anchored */}
      <span data-tour="pg-history">
        <Button
          variant="unstyled"
          iconOnly
          className={`${styles.icon} ${isHistoryOpen ? styles.iconFixedActive : ""}`}
          style={{ ["--panel-accent" as string]: "var(--color-teal)" }}
          onClick={onOpenHistory}
          title={t('activityBar.executionHistory')}
          icon="clock-rotate-left"
        />
      </span>

      {/* Feature tour — bottom-anchored */}
      <Button
        variant="unstyled"
        iconOnly
        className={styles.icon}
        style={{ ["--panel-accent" as string]: "var(--primary-color)" }}
        onClick={onOpenTour}
        title={t('activityBar.tourButton')}
        aria-label={t('activityBar.openTour')}
        icon="circle-question"
      />
    </div>
  );
}

// Right Activity Bar
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
    <div className={`${styles.bar} ${styles.barRight}`} data-tour="pg-right-bar">
      {displayIds.map((id, idx) => (
        <SortableIcon
          key={id}
          panelId={id}
          isActive={!collapsedPanels.has(id)}
          onClick={() => onTogglePanel(id)}
          tourAttr={idx === 0 && leftDockedId === null ? 'pg-drag-icon' : undefined}
        />
      ))}
      <div className={styles.spacer} />
    </div>
  );
}
