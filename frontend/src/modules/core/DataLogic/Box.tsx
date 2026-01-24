import { BaseElement } from "./BaseElement";
export class Box extends BaseElement {
  width: number = 60;
  height: number = 80;
  length: number = 0;
  autoScale: boolean = false; // true: 畫成 bar (依 value 決定長度)，false: 畫固定 block
  constructor() {
    super("box");
  }
}
