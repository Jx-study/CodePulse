import { PointerSensor } from "@dnd-kit/core";
import type { PointerEvent } from "react";

/**
 * 擴展 PointerSensor，自動忽略互動元素（Input, Button 等）的拖曳行為
 *
 * 當頁面中有可拖曳的 Panel 時，內部的 Input/Slider 會被拖曳系統攔截，
 * 導致無法正常操作。
 *
 * 透過自定義 Sensor，我們在事件偵測的源頭就過濾掉互動元素，
 * 而不是在每個組件中手動 stopPropagation。
 */
export class SmartPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as const,
      handler: ({ nativeEvent: event }: PointerEvent) => {
        // 只處理主要按鈕（滑鼠左鍵）的點擊
        if (!event.isPrimary || event.button !== 0) {
          return false;
        }

        // 如果點擊的是互動元素，不啟動拖曳
        if (isInteractiveElement(event.target as Element)) {
          return false;
        }

        return true;
      },
    },
  ];
}

/**
 * 判斷元素是否為互動元素（應該被排除在拖曳之外）
 */
function isInteractiveElement(element: Element | null): boolean {
  if (!element) return false;

  const interactiveElements = [
    "button",
    "input",
    "textarea",
    "select",
    "option",
  ];

  // 檢查元素本身
  if (
    element.tagName &&
    interactiveElements.includes(element.tagName.toLowerCase())
  ) {
    return true;
  }

  // 檢查是否有 contenteditable 屬性
  if (element.getAttribute("contenteditable") === "true") {
    return true;
  }

  // 可以擴展：檢查特定的 class 或 data 屬性
  // 例如：if (element.classList.contains('no-drag')) return true;

  return false;
}
