import React, { useEffect, useRef } from "react";
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
