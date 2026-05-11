import { useState, useCallback } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { hasSortableData, arrayMove } from "@dnd-kit/sortable";
import type { PanelId } from "../components/DockablePanel";

const DEFAULT_RIGHT_ORDER: PanelId[] = ["console", "localVars", "callStack", "globalVars"];

export function usePlaygroundPanelLayout() {
  const [leftDockedId, setLeftDockedId] = useState<PanelId | null>(null);
  const [rightOrder, setRightOrder] = useState<PanelId[]>(DEFAULT_RIGHT_ORDER);
  const [collapsedPanels, setCollapsedPanels] = useState<Set<PanelId>>(new Set());
  const [isDragActive, setIsDragActive] = useState(false);

  const handleTogglePanel = useCallback((id: PanelId) => {
    setCollapsedPanels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDragStart = useCallback((_e: DragStartEvent) => setIsDragActive(true), []);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      setIsDragActive(false);
      const panelId = e.active.data.current?.panelId as PanelId | undefined;
      if (!panelId) return;

      if (e.over?.id === "left-drop-zone") {
        const previouslyDocked = leftDockedId;
        setLeftDockedId(panelId);
        setRightOrder((prev) => {
          const without = prev.filter((id) => id !== panelId);
          if (previouslyDocked && previouslyDocked !== panelId) {
            return [...without, previouslyDocked];
          }
          return without;
        });
        setCollapsedPanels((prev) => {
          const next = new Set(prev);
          next.delete(panelId);
          return next;
        });
        return;
      }

      if (panelId === leftDockedId) {
        setLeftDockedId(null);
        setRightOrder((prev) => {
          if (e.over && hasSortableData(e.over)) {
            const overId = e.over.id as PanelId;
            const overIndex = prev.indexOf(overId);
            if (overIndex !== -1) {
              const result = [...prev];
              result.splice(overIndex, 0, panelId);
              return result;
            }
          }
          return [...prev, panelId];
        });
        return;
      }

      if (hasSortableData(e.active) && e.over && hasSortableData(e.over)) {
        const overId = e.over.id as PanelId;
        setRightOrder((prev) => {
          const oldIndex = prev.indexOf(panelId);
          const newIndex = prev.indexOf(overId);
          if (oldIndex === -1 || newIndex === -1) return prev;
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
    },
    [leftDockedId],
  );

  return {
    leftDockedId,
    rightOrder,
    collapsedPanels,
    isDragActive,
    handleTogglePanel,
    handleDragStart,
    handleDragEnd,
  };
}
