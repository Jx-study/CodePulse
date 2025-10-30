import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { BaseElement } from "../DataLogic/BaseElement";
import { renderAll } from "./D3Renderer";

export function D3Canvas({ elements, width = 800, height = 600 }: {
  elements: BaseElement[];
  width?: number;
  height?: number;
}) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    // 清空 SVG 內容以確保重新渲染
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    // 重新渲染元素
    renderAll(ref.current, elements);
  }, [elements]);

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      style={{ background: "#111", display: "block" }}
    />
  );
}
