import { createContext, useContext, useState, ReactNode } from "react";
import { getRequiredPanelIds } from "../components/PanelRegistry";

/**
 * Tutorial page 的面板順序和狀態管理上下文
 */

interface PanelContextValue {
  // Main panel order (horizontal): left/right main panels
  mainPanelOrder: string[];

  // Right panel order (vertical): canvas, controlsBar
  rightPanelOrder: string[];

  // Active panels (for dynamic panel management)
  activePanels: string[];

  // Collapsed panels tracking
  collapsedPanels: Set<string>;

  // Panel sizes (for maintaining size during swap)
  panelSizes: { [key: string]: number };

  // Methods
  swapMainPanels: (currentCodeEditorSize?: number, currentRightPanelSize?: number) => void;
  reorderRightPanels: (oldIndex: number, newIndex: number) => void;
  setCollapsed: (panelId: string, collapsed: boolean) => void;
  togglePanel: (panelId: string) => void;
  resetPanels: () => void;
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
    "inspector", // 替換原有的 "actionBar" 和其他面板
  ]);

  // Initialize active panels with defaults (包含 canvas 和 Inspector 內的 Tab)
  const [activePanels, setActivePanels] = useState<string[]>([
    "canvas",
    "actionBar", // Inspector 內的 Tab
    "variableStatus", // 變數狀態 Tab
    "callStack", // Call Stack Tab
  ]);

  const [collapsedPanels, setCollapsedPanels] = useState<Set<string>>(
    new Set()
  );

  // Panel sizes tracking (記錄每個面板的當前尺寸)
  const [panelSizes, setPanelSizes] = useState<{ [key: string]: number }>({
    codeEditor: 35,
    rightPanel: 65,
  });

  const swapMainPanels = (currentCodeEditorSize?: number, currentRightPanelSize?: number) => {
    setMainPanelOrder((prev) => [...prev].reverse());
    // 記錄當前實際尺寸，不交換值
    // codeEditor 無論在左還是右，都保持自己的大小
    if (currentCodeEditorSize !== undefined && currentRightPanelSize !== undefined) {
      setPanelSizes({
        codeEditor: currentCodeEditorSize,
        rightPanel: currentRightPanelSize,
      });
    }
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

  /**
   * 切換面板的顯示/隱藏狀態
   * 注意: 必須顯示的面板(required: true)不能被關閉
   */
  const togglePanel = (panelId: string) => {
    const requiredPanelIds = getRequiredPanelIds();

    // 如果是必須面板,不能被移除
    if (requiredPanelIds.includes(panelId)) {
      return;
    }

    setActivePanels((prev) => {
      if (prev.includes(panelId)) {
        // 移除面板
        return prev.filter((id) => id !== panelId);
      } else {
        // 添加面板
        return [...prev, panelId];
      }
    });

    // 同步更新 rightPanelOrder
    setRightPanelOrder((prev) => {
      if (prev.includes(panelId)) {
        return prev.filter((id) => id !== panelId);
      } else {
        return [...prev, panelId];
      }
    });
  };

  /**
   * 重置面板為默認狀態
   */
  const resetPanels = () => {
    setActivePanels(["canvas", "actionBar", "variableStatus", "callStack"]);
    setRightPanelOrder(["canvas", "inspector"]);
    setCollapsedPanels(new Set());
  };

  const value: PanelContextValue = {
    mainPanelOrder,
    rightPanelOrder,
    activePanels,
    collapsedPanels,
    panelSizes,
    swapMainPanels,
    reorderRightPanels,
    setCollapsed,
    togglePanel,
    resetPanels,
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