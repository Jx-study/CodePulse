import { Action } from "./Action";

class Player {
    private i = 0;
    private raf = 0;
    constructor(private actions: Action[], private onStep: (a: Action)=>void) {}
    step() { if (this.i < this.actions.length) this.onStep(this.actions[this.i++]); }
    play(speed = 300 /* ms/step */) {
      let last = performance.now();
      const loop = (now: number) => {
        if (now - last >= speed) { this.step(); last = now; }
        if (this.i < this.actions.length) this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }
    pause() { cancelAnimationFrame(this.raf); }
  }