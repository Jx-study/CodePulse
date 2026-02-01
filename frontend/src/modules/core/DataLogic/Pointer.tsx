import { BaseElement } from "./BaseElement";

export type PointerDirection = "up" | "down";

export class Pointer extends BaseElement {
  label: string;
  targetId?: string; // Optional: ID of the element being pointed to
  direction: PointerDirection;

  constructor(label: string = "Top", direction: PointerDirection = "up") {
    super("pointer");
    this.label = label;
    this.direction = direction;
  }
}
