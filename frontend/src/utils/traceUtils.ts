import type { TraceEvent } from "@/types/trace";

/**
 * Rebuilds the call stack at a given step by replaying CALL/RETURN events
 * up to and including that step.
 */
export function rebuildCallStack(trace: TraceEvent[], upToStep: number): string[] {
  const stack: string[] = [];
  for (let i = 0; i <= upToStep && i < trace.length; i++) {
    const ev = trace[i];
    if (ev.tag === "CALL") stack.push(ev.meta?.func_name ?? "");
    else if (ev.tag === "RETURN" && stack.length > 0) stack.pop();
  }
  return stack;
}
