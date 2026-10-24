import { describe, expect, it, vi, afterEach } from "vitest";
import {
  handleDuplicateReplay,
  InputCancelledError,
  waitForInputPrompt,
} from "./usePlaygroundRun";
import type { PlaygroundHistoryRecord } from "@/types/playgroundHistory";

const record: PlaygroundHistoryRecord = {
  id: 7,
  detected_algorithm: "bubble_sort",
  confidence_score: 0.9,
  time_complexity: "O(n²)",
  analysis_source: "ast+bigO",
  code_preview: "def bubble_sort(): ...",
  user_code: "def bubble_sort():\n    pass\n",
  created_at: "2026-05-18T00:00:00",
  have_level1: true,
  is_truncated: false,
  execution_trace: [],
  raw_trace: [],
  raw_index_map: [],
  call_graph: null,
  cfg_graph: {},
  stdout_events: [],
  top3_candidates: [],
  ai_summary: null,
  ai_feedback: null,
};

describe("handleDuplicateReplay", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows duplicate toast immediately and loads history after 3 seconds", () => {
    vi.useFakeTimers();
    const showDuplicateToast = vi.fn();
    const loadFromHistory = vi.fn();

    handleDuplicateReplay(record, showDuplicateToast, loadFromHistory);

    expect(showDuplicateToast).toHaveBeenCalledOnce();
    expect(loadFromHistory).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2999);
    expect(loadFromHistory).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(loadFromHistory).toHaveBeenCalledOnce();
    expect(loadFromHistory).toHaveBeenCalledWith(record);
  });
});

describe("waitForInputPrompt", () => {
  it("rejects and clears the prompt when the run is aborted", async () => {
    const controller = new AbortController();
    const setInputPrompt = vi.fn();

    const promise = waitForInputPrompt(
      "name: ",
      0,
      setInputPrompt,
      controller.signal,
    );

    expect(setInputPrompt).toHaveBeenCalledWith({
      prompt: "name: ",
      inputIndex: 0,
      resolve: expect.any(Function),
    });

    controller.abort();

    await expect(promise).rejects.toMatchObject({
      name: "AbortError",
      message: "Aborted",
    });
    expect(setInputPrompt).toHaveBeenLastCalledWith(null);
  });

  it("rejects and clears the prompt when Edit Code is clicked while input prompt is open", async () => {
    // 模擬：code 跑到 input() 暫停，使用者點 Edit Code（abort controller）
    const controller = new AbortController();
    const setInputPrompt = vi.fn();

    const promise = waitForInputPrompt(
      "Enter value: ",
      1,
      setInputPrompt,
      controller.signal,
    );

    // 彈窗已顯示
    expect(setInputPrompt).toHaveBeenCalledWith({
      prompt: "Enter value: ",
      inputIndex: 1,
      resolve: expect.any(Function),
    });

    // handleEditCode 呼叫 abortRef.current.abort()
    controller.abort();

    await expect(promise).rejects.toMatchObject({
      name: "AbortError",
    });
    // 彈窗必須被清除
    expect(setInputPrompt).toHaveBeenLastCalledWith(null);
  });

  it("resolves with null when the user cancels the input prompt", async () => {
    const controller = new AbortController();
    const setInputPrompt = vi.fn();

    const promise = waitForInputPrompt(
      "Enter value: ",
      0,
      setInputPrompt,
      controller.signal,
    );

    const promptState = setInputPrompt.mock.calls[0][0];
    promptState.resolve(null);

    await expect(promise).resolves.toBeNull();
    expect(setInputPrompt).toHaveBeenLastCalledWith(null);
  });
});

describe("InputCancelledError", () => {
  it("marks user cancellation separately from runtime errors", () => {
    const err = new InputCancelledError();

    expect(err.name).toBe("InputCancelledError");
    expect(err.message).toBe("input cancelled");
  });
});
