import { BaseElement } from "./BaseElement";

export class Pointer extends BaseElement {
  label: string;
  targetId?: string; // Optional: ID of the element being pointed to

  constructor(label: string = "Top") {
    super("pointer");
    this.label = label;
  }
}
