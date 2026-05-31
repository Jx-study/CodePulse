import { describe, expect, it, vi, afterEach } from "vitest";
import { handleDuplicateReplay, waitForInputPrompt } from "./usePlaygroundRun";
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
});
