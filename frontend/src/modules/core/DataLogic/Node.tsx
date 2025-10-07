import { BaseElement } from "./BaseElement";
export class Node extends BaseElement {
  radius: number = 20;
  // TODO: 是否要將 pointerNode 改成 array<Node>
  pointerNode: Node | null = null;
  constructor() { super("node"); }
}