import { afterEach, describe, expect, it, vi } from "vitest";
import { InputNeededError, run } from "./AnalyzeService";

class MockEventSource {
  static instances: MockEventSource[] = [];
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn();

  constructor(
    public readonly url: string,
    public readonly init?: EventSourceInit,
  ) {
    MockEventSource.instances.push(this);
  }
}

describe("AnalyzeService.run", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    MockEventSource.instances = [];
  });

  it("passes the abort signal to the submit request", async () => {
    const controller = new AbortController();
    let submitSignal: AbortSignal | null = null;

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) => {
        submitSignal = init?.signal ?? null;
        return new Response(JSON.stringify({ task_id: "task-1" }), {
          status: 202,
          headers: { "Content-Type": "application/json" },
        });
      }),
    );
    vi.stubGlobal("EventSource", MockEventSource);

    const promise = run("print('hi')", vi.fn(), controller.signal);
    await vi.waitFor(() => expect(MockEventSource.instances).toHaveLength(1));

    expect(submitSignal).toBe(controller.signal);

    controller.abort();
    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  });

  it("includes partial stdout events when the backend pauses for input", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(JSON.stringify({ task_id: "task-1" }), {
          status: 202,
          headers: { "Content-Type": "application/json" },
        });
      }),
    );
    vi.stubGlobal("EventSource", MockEventSource);

    const promise = run("print('ready')\ninput('name: ')", vi.fn());
    await vi.waitFor(() => expect(MockEventSource.instances).toHaveLength(1));

    MockEventSource.instances[0].onmessage?.(
      new MessageEvent("message", {
        data: JSON.stringify({
          status: "input_needed",
          prompt: "name: ",
          input_index: 0,
          stdout_events: [{ step: 1, text: "ready" }],
        }),
      }),
    );

    const err = await promise.catch((caught) => caught);

    expect(err).toBeInstanceOf(InputNeededError);
    expect(err).toMatchObject({
      prompt: "name: ",
      inputIndex: 0,
      stdoutEvents: [{ step: 1, text: "ready" }],
    });
  });
});
