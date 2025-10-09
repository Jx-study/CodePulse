export type Status = "unfinished" | "prepare" | "target" | "complete";

export const statusColorMap: Record<Status, string> = {
  unfinished: "blue",
  prepare: "yellow",
  target: "orange",
  complete: "green",
};

export abstract class BaseElement {
  readonly kind: "node" | "box";
  id: string = "";
  value = 0;
  position = { x: 0, y: 0 };
  status: Status = "unfinished";
  description = "";

  protected constructor(kind: "node" | "box") {
    this.kind = kind;
  }
  moveTo(x: number, y: number) { this.position = { x, y }; }
  setStatus(s: Status) { this.status = s; }
  getColor() { return statusColorMap[this.status]; }
  
}
