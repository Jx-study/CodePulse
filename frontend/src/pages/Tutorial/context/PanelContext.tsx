import { createContext, useContext, useState, ReactNode } from "react";

/**
 * Tutorial page 的面板順序和狀態管理上下文
 */

interface PanelContextValue {
  // Main panel order (horizontal): left/right main panels
  mainPanelOrder: string[];

  // Right panel order (vertical): canvas, controls, action bar
  rightPanelOrder: string[];

  // Collapsed panels tracking
  collapsedPanels: Set<string>;

  // Methods
  swapMainPanels: () => void;
  reorderRightPanels: (oldIndex: number, newIndex: number) => void;
  setCollapsed: (panelId: string, collapsed: boolean) => void;
}

const PanelContext = createContext<PanelContextValue | undefined>(undefined);

interface PanelProviderProps {
  children: ReactNode;
}

export function PanelProvider({ children }: PanelProviderProps) {
  // Initialize main panel order with defaults
  const [mainPanelOrder, setMainPanelOrder] = useState<string[]>([
    "codeEditor",
    "rightPanel",
  ]);

  // Initialize right panel order with defaults
  const [rightPanelOrder, setRightPanelOrder] = useState<string[]>([
    "canvas",
    "actionBar",
  ]);

  const [collapsedPanels, setCollapsedPanels] = useState<Set<string>>(
    new Set()
  );

  const swapMainPanels = () => {
    setMainPanelOrder((prev) => [...prev].reverse());
  };

  const reorderRightPanels = (oldIndex: number, newIndex: number) => {
    setRightPanelOrder((prev) => {
      const newOrder = [...prev];
      const [removed] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, removed);
      return newOrder;
    });
  };

  const setCollapsed = (panelId: string, collapsed: boolean) => {
    setCollapsedPanels((prev) => {
      const newSet = new Set(prev);
      if (collapsed) {
        newSet.add(panelId);
      } else {
        newSet.delete(panelId);
      }
      return newSet;
    });
  };

  const value: PanelContextValue = {
    mainPanelOrder,
    rightPanelOrder,
    collapsedPanels,
    swapMainPanels,
    reorderRightPanels,
    setCollapsed,
  };

  return (
    <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
  );
}

export function usePanelContext() {
  const context = useContext(PanelContext);
  if (!context) {
    throw new Error("usePanelContext must be used within PanelProvider");
  }
  return context;
}