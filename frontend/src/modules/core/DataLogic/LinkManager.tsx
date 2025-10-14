import { BaseElement } from "./BaseElement";
import type { Link } from "../Render/D3Renderer";

const makeKey = (s: string, t: string) => `${s}->${t}`;

export class LinkManager {
  private elementsById = new Map<string, BaseElement>();
  private _links: Link[] = [];

  constructor(elements: BaseElement[] = []) {
    this.setElements(elements);
  }

  get links(): Link[] {
    return this._links;
  }

  setElements(elements: BaseElement[]) {
    this.elementsById = new Map(elements.map(e => [String(e.id), e]));
  }

  connect(sourceId: string, targetId: string) {
    if (!this.elementsById.has(sourceId) || !this.elementsById.has(targetId)) return;
    const key = makeKey(sourceId, targetId);
    if (this._links.some(l => l.key === key)) return;
    this._links = [...this._links, { key, sourceId, targetId }];
  }

  disconnect(sourceId: string, targetId: string) {
    const key = makeKey(sourceId, targetId);
    this._links = this._links.filter(l => l.key !== key);
  }

  clear() {
    this._links = [];
  }
}