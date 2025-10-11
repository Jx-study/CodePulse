import { Status } from "../DataLogic/BaseElement";

export type Action =
  | { type: "setStatus"; id: string; status: Status }
  | { type: "moveTo"; id: string; x: number; y: number }
  | { type: "addLink"; from: string; to: string };