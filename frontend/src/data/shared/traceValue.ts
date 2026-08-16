import type { JsonValue } from "@/types/trace";

/**
 * Narrows a trace event's `local_vars`/`meta` bag (backend-sent, structurally
 * typed as JSON) to the shape a specific algorithm's trace contract actually
 * sends. There's no way to verify this statically — each algorithm's tags
 * determine which keys are present — so this documents the assumption at the
 * point of use instead of leaving it as an implicit `any`.
 */
export function asTrace<T>(vars: Record<string, JsonValue> | undefined): T {
  return (vars ?? {}) as unknown as T;
}
