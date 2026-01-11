import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as d3 from "d3";
import { BaseElement } from "../DataLogic/BaseElement";
import { renderAll } from "./D3Renderer";
import type { Link } from "./D3Renderer";

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
  }
>(({ elements, links = [], width = 800, height = 600 }, forwardedRef) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useImperativeHandle(forwardedRef, () => ({
    getSVGElement: () => ref.current,
  }));

  useEffect(() => {
    if (!ref.current) return;
    renderAll(ref.current, elements, links);
  }, [elements, links]);

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      style={{ background: "#111", display: "block" }}
    />
  );
});
