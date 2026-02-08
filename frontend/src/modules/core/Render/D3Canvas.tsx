import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";
import * as d3 from "d3";
import { BaseElement } from "../DataLogic/BaseElement";
import { renderAll } from "./D3Renderer";
import type { Link } from "./D3Renderer";
import { useZoom } from "@/shared/hooks/useZoom";
import { useDrag } from "@/shared/hooks/useDrag";
import Button from "@/shared/components/Button";
import StatusLegend from "../components/StatusLegend";
import styles from './D3Canvas.module.scss';

export interface D3CanvasRef {
  getSVGElement: () => SVGSVGElement | null;
}

export const D3Canvas = forwardRef<
  D3CanvasRef,
  {
    elements: BaseElement[];
    links?: Link[];
    width?: number;
    height?: number;
    structureType?: string;
    /** 是否啟用縮放功能 (預設: true) */
    enableZoom?: boolean;
    /** 是否啟用拖拽平移功能 (預設: true) */
    enablePan?: boolean;
  }
>(
  (
    {
      elements,
      links = [],
      width = 800,
      height = 600,
      structureType = "linkedlist", // default value
      enableZoom = true,
      enablePan = true,
    },
    forwardedRef,
  ) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    // 動態 viewBox 狀態
    const [dynamicViewBox, setDynamicViewBox] = useState(
      `0 0 ${width} ${height}`,
    );

    // 拖拽功能 (使用 useDrag hook，邊界係數 0.7)
    const drag = useDrag<HTMLDivElement>({
      enabled: enablePan,
      boundaryRatio: 0.7,
    });

    // 縮放功能
    const { zoomLevel, transformOrigin, resetZoom } = useZoom({
      minZoom: 0.5,
      maxZoom: 2.0,
      initialZoom: 1.0,
      step: 0.1,
      enableWheelZoom: enableZoom,
      enablePinchZoom: enableZoom,
      enableMouseCenteredZoom: enableZoom,
      targetRef: drag.containerRef,
    });

    // 重置視圖（縮放 + 位移）
    const handleResetView = () => {
      resetZoom();
      drag.setOffset({ x: 0, y: 0 });
    };

    useImperativeHandle(forwardedRef, () => ({
      getSVGElement: () => svgRef.current,
    }));

    useEffect(() => {
      const svgElement = svgRef.current;
      if (!svgElement) return;

      renderAll(svgElement, elements, links, structureType);

      // 動態計算 viewBox 以適應內容
      try {
        const bbox = svgElement.getBBox();
        const padding = 40;

        // 如果 bbox 有效（非零寬高），則更新 viewBox
        if (bbox.width > 0 && bbox.height > 0) {
          const newViewBox = `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`;
          setDynamicViewBox(newViewBox);
        }
      } catch (error) {
        // getBBox 可能在某些情況下失敗（如 SVG 為空），使用預設值
        console.warn("Failed to calculate SVG bounding box:", error);
        setDynamicViewBox(`0 0 ${width} ${height}`);
      }

      // 清理函數：當組件卸載或依賴變更時，中斷所有進行中的 D3 transition
      return () => {
        if (svgElement) {
          // 選擇所有正在進行的 transition 並中斷它們
          const svg = d3.select(svgElement);
          svg.selectAll("*").interrupt();
        }
      };
    }, [elements, links, structureType, width, height]);

    return (
      <div
        ref={drag.containerRef}
        className={`${styles.canvasContainer} ${drag.isDragging ? styles.dragging : ""} ${enablePan ? styles["pan-enabled"] : ""}`}
        onMouseDown={drag.handleMouseDown}
        onMouseMove={drag.handleMouseMove}
        onMouseUp={drag.handleMouseUp}
        onMouseLeave={drag.handleMouseUp}
        onTouchStart={drag.handleTouchStart}
        onTouchMove={drag.handleTouchMove}
        onTouchEnd={drag.handleTouchEnd}
      >
        <div
          ref={contentRef}
          className={`${styles.canvasContent} ${drag.isDragging ? styles.dragging : ""}`}
          style={{
            transformOrigin: transformOrigin,
            transform: `translate(${drag.offset.x}px, ${drag.offset.y}px) scale(${zoomLevel})`,
          }}
        >
          <svg
            ref={svgRef}
            viewBox={dynamicViewBox}
            preserveAspectRatio="xMidYMid meet"
            className={styles.canvas}
          />
        </div>

        {/* 狀態圖例 */}
        <div className={styles.statusLegendContainer}>
          <StatusLegend />
        </div>

        {/* Reset 按鈕 */}
        {(enableZoom || enablePan) && (
          <div className={styles.resetButtonContainer}>
            <Button
              variant="icon"
              size="sm"
              onClick={handleResetView}
              aria-label="重置視圖"
              className={styles.resetButton}
              icon="rotate-right"
              iconOnly
            >
            </Button>
          </div>
        )}
      </div>
    );
  }
);
