import { BaseElement } from "./BaseElement";

export class Node extends BaseElement {
  radius: number = 20;
  pointers: Node[] = [];

  constructor() {
    super("node");
  }

  addPointer(target: Node) {
    if (!this.pointers.find((p) => p.id === target.id)) {
      this.pointers.push(target);
    }
  }
}
