export type Status =
  | "unfinished"
  | "prepare"
  | "target"
  | "complete"
  | "inactive";

export const statusColorMap: Record<Status, string> = {
  unfinished: "#1d79cfff",
  prepare: "yellow",
  target: "orange",
  complete: "#46f336ff",
  inactive: "#555555",
};

export abstract class BaseElement {
  readonly kind: "node" | "box";
  id: string = "";
  // if value undefined will not be rendered
  value: number | undefined = 0;
  position = { x: 0, y: 0 };
  status: Status = "unfinished";
  description = "";

  protected constructor(kind: "node" | "box") {
    this.kind = kind;
  }
  moveTo(x: number, y: number) {
    this.position = { x, y };
  }
  setStatus(s: Status) {
    this.status = s;
  }
  getColor() {
    return statusColorMap[this.status];
  }
}
