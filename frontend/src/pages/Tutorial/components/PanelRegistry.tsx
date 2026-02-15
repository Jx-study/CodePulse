import React from "react";
import Icon from "@/shared/components/Icon";
import type { PanelRegistry } from "@/types";

// 延遲加載組件以優化性能
const D3Canvas = React.lazy(() =>
  import("@/modules/core/Render/D3Canvas").then((module) => ({
    default: module.D3Canvas,
  }))
);

const SmartActionBar = React.lazy(() =>
  import("./SmartActionBar").then((module) => ({
    default: module.SmartActionBar,
  }))
);

const VariableWatch = React.lazy(() =>
  import("@/modules/core/components/VariableWatch/VariableWatch").then((module) => ({
    default: module.VariableWatch,
  }))
);


/**
 * 面板註冊表
 * 集中管理所有可用的面板配置
 */
export const PANEL_REGISTRY: PanelRegistry = {
  canvas: {
    id: "canvas",
    title: "視覺化動畫",
    icon: <Icon name="chart-line" />,
    component: D3Canvas,
    defaultSize: 65,
    category: "visualization",
    required: true, // Canvas 必須顯示
    isTab: false,
  },
  actionBar: {
    id: "actionBar",
    title: "操作面板",
    icon: <Icon name="sliders" />,
    component: SmartActionBar,
    defaultSize: 35,
    category: "control",
    required: false, // actionBar 變為可選
    isTab: true,
    tabGroup: "inspector",
  },
  variableStatus: {
    id: "variableStatus",
    title: "變數狀態",
    icon: <Icon name="table" />,
    component: VariableWatch,
    defaultSize: 35,
    category: "info",
    required: false,
    isTab: true,
    tabGroup: "inspector"
  },
  callStack: {
    id: "callStack",
    title: "Call Stack",
    icon: <Icon name="layer-group" />,
    // component: import("@/modules/core/components/CallStack/CallStack")
    component: React.lazy(() =>
      Promise.resolve({
        default: () => (
          <div
            style={{
              padding: "1rem",
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            Call Stack 面板 - ComingSoon
          </div>
        ),
      }),
    ),
    defaultSize: 35,
    category: "info",
    required: false,
    isTab: true,
    tabGroup: "inspector"
  },
};

/**
 * 獲取所有必須顯示的面板ID
 */
export const getRequiredPanelIds = (): string[] => {
  return Object.values(PANEL_REGISTRY)
    .filter((panel) => panel.required)
    .map((panel) => panel.id);
};
