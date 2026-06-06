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

  it("posts input and continues on the same SSE stream", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/api/analyze/submit")) {
        return new Response(JSON.stringify({ task_id: "task-1" }), {
          status: 202,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.endsWith("/api/analyze/input/task-1")) {
        return new Response(JSON.stringify({ status: "accepted" }), {
          status: 202,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.endsWith("/api/analyze/result/task-1")) {
        return new Response(JSON.stringify({
          execution_trace: [],
          raw_trace: [],
          raw_index_map: [],
          is_truncated: false,
          stdout_events: [{ step: 1, text: "Ada" }],
          call_graph: null,
          cfg_graph: {},
          top3_candidates: [],
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("EventSource", MockEventSource);

    const onInputNeeded = vi.fn(async () => "Ada");
    const promise = run("name = input('name: ')", vi.fn(), undefined, {
      onInputNeeded,
    });
    await vi.waitFor(() => expect(MockEventSource.instances).toHaveLength(1));

    MockEventSource.instances[0].onmessage?.(
      new MessageEvent("message", {
        data: JSON.stringify({
          status: "input_needed",
          task_id: "task-1",
          prompt: "name: ",
          input_index: 0,
        }),
      }),
    );

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/analyze/input/task-1"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ value: "Ada" }),
        }),
      );
    });

    MockEventSource.instances[0].onmessage?.(
      new MessageEvent("message", {
        data: JSON.stringify({ status: "completed" }),
      }),
    );

    await expect(promise).resolves.toMatchObject({
      stdoutEvents: [{ step: 1, text: "Ada" }],
    });
    expect(onInputNeeded).toHaveBeenCalledWith("name: ", 0);
    expect(MockEventSource.instances).toHaveLength(1);
    const submitCalls = fetchMock.mock.calls.filter(([url]) => url.endsWith("/api/analyze/submit"));
    expect(submitCalls).toHaveLength(1);
  });

  it("cancels the backend task when the user dismisses the input dialog", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/api/analyze/submit")) {
        return new Response(JSON.stringify({ task_id: "task-1" }), {
          status: 202,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.endsWith("/api/analyze/cancel/task-1")) {
        return new Response(JSON.stringify({ status: "accepted" }), {
          status: 202,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("EventSource", MockEventSource);

    // 使用者按取消 → callback 回傳 null
    const onInputNeeded = vi.fn(async () => null);
    const promise = run("name = input('name: ')", vi.fn(), undefined, {
      onInputNeeded,
    });
    // 先掛 rejection handler，避免 reject 早於斷言 attach 觸發 unhandled rejection
    const settled = promise.catch((e) => e);
    await vi.waitFor(() => expect(MockEventSource.instances).toHaveLength(1));

    MockEventSource.instances[0].onmessage?.(
      new MessageEvent("message", {
        data: JSON.stringify({
          status: "input_needed",
          task_id: "task-1",
          prompt: "name: ",
          input_index: 0,
        }),
      }),
    );

    // 取消對話框必須打 cancel 端點喚醒後端，而非讓 task 卡到 input timeout
    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/analyze/cancel/task-1"),
        expect.objectContaining({ method: "POST" }),
      );
    });

    expect(await settled).toBeInstanceOf(InputNeededError);
  });

  it("treats backend cancelled terminal events as aborts", async () => {
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

    const promise = run("input('name: ')", vi.fn());
    await vi.waitFor(() => expect(MockEventSource.instances).toHaveLength(1));

    MockEventSource.instances[0].onmessage?.(
      new MessageEvent("message", {
        data: JSON.stringify({
          status: "failed",
          error: "cancelled",
        }),
      }),
    );

    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  });
});
