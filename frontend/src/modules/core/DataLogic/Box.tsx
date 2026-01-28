import { BaseElement } from "./BaseElement";
export class Box extends BaseElement {
  width: number = 60;
  height: number = 80;
  length: number = 0;
  autoScale: boolean = false; // true: 畫成 bar (依 value 決定長度)，false: 畫固定 block
  // 用於 AutoScale 的分組 ID，所有同 Group 的 Box 會共用同一個 Scale 比例
  scaleGroup: string = "default";
  maxHeight: number = 150;
  constructor() {
    super("box");
  }
}
