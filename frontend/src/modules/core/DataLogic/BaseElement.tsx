import type { StatusColorMap } from "@/types/statusConfig";

export type Status =
  | "unfinished"
  | "prepare"
  | "target"
  | "complete"
  | "inactive";

export const statusColorMap: Record<Status, string> = {
  unfinished: "#1d79cfff", // $status-unfinished
  prepare: "#f59e0b", // $status-prepare
  target: "#ff6b35", // $status-target
  complete: "#46f336ff", // $status-complete
  inactive: "#555555", // $status-inactive
};

export abstract class BaseElement {
  readonly kind: "node" | "box" | "pointer";
  id: string = "";
  // if value undefined will not be rendered
  value: number | undefined = 0;
  position = { x: 0, y: 0 };
  // Changed to string to support custom status names
  status: string = "unfinished";
  description = "";

  protected constructor(kind: "node" | "box" | "pointer") {
    this.kind = kind;
  }
  moveTo(x: number, y: number) {
    this.position = { x, y };
  }
  // Updated to accept string instead of Status
  setStatus(s: string) {
    this.status = s;
  }
  // Inject custom color map
  setCustomColorMap(colorMap: StatusColorMap) {
    this.customColorMap = colorMap;
  }
  // Updated to use custom map if available, fallback to default
  getColor(): string {
    if (this.customColorMap) {
      return (
        this.customColorMap[this.status] ??
        statusColorMap[this.status as Status] ??
        "#888888"
      );
    }
    return statusColorMap[this.status as Status] ?? "#888888";
  }
}
