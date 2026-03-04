import type { StatusColorMap } from "@/types/statusConfig";

export enum Status {
  Unfinished = "unfinished",
  Prepare = "prepare",
  Target = "target",
  Complete = "complete",
  Inactive = "inactive",
}

export const statusColorMap: Record<Status, string> = {
  [Status.Unfinished]: "#1d79cfff", // $status-unfinished
  [Status.Prepare]: "#f59e0b", // $status-prepare
  [Status.Target]: "#ff6b35", // $status-target
  [Status.Complete]: "#46f336ff", // $status-complete
  [Status.Inactive]: "#555555", // $status-inactive
};

export abstract class BaseElement {
  readonly kind: "node" | "box" | "pointer";
  id: string = "";
  // if value is '' (empty string) will not be rendered
  value: string = '0';
  position = { x: 0, y: 0 };
  status: Status = Status.Unfinished;
  description = "";
  customColorMap?: StatusColorMap;
  /** 1 = 完全可見，0 = 隱形（仍佔 bbox，getBBox 計入） */
  opacity: number = 1;

  protected constructor(kind: "node" | "box" | "pointer") {
    this.kind = kind;
  }
  moveTo(x: number, y: number) {
    this.position = { x, y };
  }
  setStatus(s: Status) {
    this.status = s;
  }
  // Inject custom color map
  setCustomColorMap(colorMap: StatusColorMap) {
    this.customColorMap = colorMap;
  }
  getColor(): string {
    if (this.customColorMap) {
      return (
        this.customColorMap[this.status] ??
        statusColorMap[this.status] ??
        "#888888"
      );
    }
    return statusColorMap[this.status] ?? "#888888";
  }
}
