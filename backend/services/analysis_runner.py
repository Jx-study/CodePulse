import logging
import ast as _ast
import concurrent.futures as _cf
from database import db
from models.explorer import ExploreHistory, AnalysisSource

from celery.exceptions import Ignore
from celery_app import celery_app
from services.sandbox import run_in_sandbox
from services.ast_complexity import analyze_complexity
from services.complexity_analyzer import measure_step_counts, generate_bigo_wrapper
from services.tracer import TraceEvent
from services.template_tracer import build_level1_trace, SUPPORTED_ALGORITHMS
from services.algo_identification import identify as algo_identify, IdentifyResult
from services.algo_identification.divergence_log import log_divergence
from services.ast_complexity import is_recursive as ast_is_recursive
from services.gemini_analysis import analyze as gemini_analyze
from services.gemini_analysis.result import GeminiAnalysisResult
from services.playground_history import find_matching_history, has_history_capacity
from services.task_queue import (
    task_queue,
    STAGE_SANDBOX,
    STAGE_ANALYSIS,
    STAGE_DONE,
)

logger = logging.getLogger(__name__)


class InputNeededSignal(Exception):
    """哨兵例外：把 input_needed 從 worker function 往上拋給 task queue。

    這不是錯誤，而是「等待使用者輸入」的暫停點。
    task queue 必須接住它並把狀態設為 STATUS_INPUT_NEEDED（不是 FAILED/COMPLETED）。
    """
    def __init__(self, prompt: str, input_index: int):
        super().__init__(f"input_needed[{input_index}]: {prompt!r}")
        self.prompt = prompt
        self.input_index = input_index


EXPECTED_STRUCTURE: dict[str, str] = {
    "bubble_sort":    "iterative",
    "selection_sort": "iterative",
    "insertion_sort": "iterative",
    "linear_search":  "iterative",
    "binary_search":  "iterative",
    "merge_sort":     "recursive",
    "quick_sort":     "recursive",
}


def _extract_input_data(trace_events: list) -> list | None:
    for ev in trace_events:
        if ev.get("tag") == "CALL":
            for val_str in ev.get("local_vars", {}).values():
                try:
                    val = _ast.literal_eval(val_str)
                    if isinstance(val, list):
                        return val
                except (ValueError, SyntaxError):
                    continue
    return None


def _to_linear_data(snapshot: list) -> list:
    return [{"id": str(i), "value": v} for i, v in enumerate(snapshot)]


def route_level1_decision(
    code: str,
    identify_result: IdentifyResult,
) -> tuple[str | None, str | None]:
    if identify_result.algo_name is None:
        return None, "low_confidence"

    is_rec = ast_is_recursive(code)
    expected = EXPECTED_STRUCTURE.get(identify_result.algo_name)
    actual = "recursive" if is_rec else "iterative"

    if expected != actual:
        return None, "structure_mismatch"

    if identify_result.algo_name not in SUPPORTED_ALGORITHMS:
        return None, "no_template"

    return identify_result.algo_name, None


def _save_history(
    user_id: int,
    code: str,
    identify_result,
    final_complexity: str,
    complexity_source: str,
    gemini_summary: dict | None,
    have_level1: bool,
    execution_trace: list,
    is_truncated: bool,
    raw_trace: list,
    raw_index_map: list,
    call_graph: dict | None,
    cfg_graph: dict,
    stdout_events: list,
) -> None:
    if find_matching_history(code, user_id) is not None:
        logger.info("Explore history duplicate found for user %s; skipping persistence", user_id)
        return

    if not has_history_capacity(user_id):
        logger.info("Explore history quota reached for user %s; skipping persistence", user_id)
        return

    source_map = {
        "gemini":       AnalysisSource.gemini,
        "ast+bigO":     AnalysisSource.ast_bigO,
        "ast":          AnalysisSource.ast_bigO,
        "bigO":         AnalysisSource.ast_bigO,
        "ast_conflict": AnalysisSource.ast_bigO,
    }
    source = source_map.get(complexity_source, AnalysisSource.ast_bigO)

    top3_candidates = [{"name": name, "score": score} for name, score in identify_result.top3]

    record = ExploreHistory(
        user_id=user_id,
        user_code=code,
        detected_algorithm=identify_result.algo_name,
        confidence_score=identify_result.score,
        time_complexity=final_complexity if final_complexity != "unknown" else None,
        analysis_source=source,
        ai_summary=gemini_summary.get("purpose") if gemini_summary else None,
        ai_feedback=gemini_summary.get("feedback") if gemini_summary else None,
        have_level1=have_level1,
        execution_trace=execution_trace,
        is_truncated=is_truncated,
        raw_trace=raw_trace,
        raw_index_map=raw_index_map,
        call_graph=call_graph,
        cfg_graph=cfg_graph,
        stdout_events=stdout_events,
        top3_candidates=top3_candidates,
    )
    db.session.add(record)
    db.session.commit()


@celery_app.task(bind=True, name="analysis_runner.run_analysis", max_retries=1)
def run_analysis_task(
    self,
    code: str,
    wrapped_code: str,
    user_id: int | None = None,
    save_history: bool | None = None,
    stdin_inputs: list[str] | None = None,
) -> dict:
    """Celery task: analysis main flow. task_id = self.request.id."""
    from app import app as flask_app
    task_id = self.request.id
    if save_history is None:
        headers = getattr(self.request, "headers", None) or {}
        save_history = headers.get("save_history", True) is not False
    with flask_app.app_context():
        try:
            return _run_analysis(
                task_id,
                code,
                wrapped_code,
                user_id=user_id,
                save_history=save_history,
                stdin_inputs=stdin_inputs,
            )
        except InputNeededSignal as sig:
            # input_needed 用自訂 state，不讓 Celery 標記成 SUCCESS/FAILURE。
            self.update_state(
                state="INPUT_NEEDED",
                meta={"prompt": sig.prompt, "input_index": sig.input_index},
            )
            raise Ignore()


def _run_analysis(
    task_id: str,
    code: str,
    wrapped_code: str,
    user_id: int | None = None,
    save_history: bool = True,
    stdin_inputs: list[str] | None = None,
) -> dict:
    logger.info("_run_analysis called with user_id=%s task_id=%s", user_id, task_id)
    task_queue.update_progress(task_id, STAGE_SANDBOX, "正在模擬執行並計算複雜度…")
    sandbox_result = run_in_sandbox(wrapped_code, stdin_inputs=stdin_inputs or [])

    # input_needed short-circuit (D10): 必須在進入 big-O / Gemini / AST 並行分析之前 raise，
    # 否則含 input() 的 code 會在 big-O 測量時重跑 5 次 sandbox，浪費資源 + 污染 log。
    if sandbox_result.get("error") == "input_needed":
        raise InputNeededSignal(
            prompt=sandbox_result["prompt"],
            input_index=sandbox_result["input_index"],
        )

    if "error" in sandbox_result:
        error_msg = sandbox_result["error"]
        logger.error("sandbox error: %s", error_msg)
        if error_msg == "timeout":
            raise RuntimeError("timeout")
        lineno = sandbox_result.get("lineno")
        raise RuntimeError(f"lineno:{lineno}:{error_msg}" if lineno else error_msg)
    else:
        execution_trace = sandbox_result.get("trace", [])
        call_graph = sandbox_result.get("call_graph")
        cfg_graph = sandbox_result.get("cfg_graph", {})
        is_truncated = sandbox_result.get("is_truncated", False)
        stdout_events = sandbox_result.get("stdout_events", [])

    task_queue.update_progress(task_id, STAGE_ANALYSIS, "正在分析時間複雜度…")
    ast_complexity = "unknown"
    bigo_complexity = "unknown"

    bigo_code = generate_bigo_wrapper(code)

    with _cf.ThreadPoolExecutor(max_workers=4) as _pool:
        _ast_fut = _pool.submit(analyze_complexity, code)
        _bigo_fut = (
            _pool.submit(measure_step_counts, bigo_code)
            if bigo_code is not None
            else None
        )
        _minilm_fut = _pool.submit(algo_identify, code)
        _gemini_fut = _pool.submit(gemini_analyze, code)

        try:
            ast_complexity = _ast_fut.result(timeout=60)
        except Exception:
            ast_complexity = "unknown"
        if _bigo_fut is not None:
            try:
                bigo_complexity = _bigo_fut.result(timeout=60)
            except Exception:
                bigo_complexity = "unknown"
        try:
            identify_result = _minilm_fut.result(timeout=60)
        except Exception:
            logger.warning("algo_identify failed, falling back to unknown", exc_info=True)
            identify_result = IdentifyResult(algo_name=None, score=0.0, top_raw="", top3=[])
        try:
            gemini_result = _gemini_fut.result(timeout=60)
        except Exception:
            logger.warning("gemini_analyze failed", exc_info=True)
            gemini_result = GeminiAnalysisResult(
                detected_algorithm=None,
                time_complexity=None,
                summary=None,
                is_fallback=True,
                fallback_reason="exception",
            )

    if ast_complexity != "unknown" and bigo_complexity != "unknown":
        if ast_complexity == bigo_complexity:
            final_complexity = ast_complexity
            complexity_source = "ast+bigO"
        else:
            final_complexity = ast_complexity
            complexity_source = "ast"
    elif ast_complexity != "unknown":
        final_complexity = ast_complexity
        complexity_source = "ast"
    elif bigo_complexity != "unknown":
        final_complexity = bigo_complexity
        complexity_source = "bigO"
    else:
        final_complexity = "unknown"
        complexity_source = "gemini"

    gemini_summary = None

    if not gemini_result.is_fallback and gemini_result.summary is not None:
        gemini_summary = {
            "purpose": gemini_result.summary.purpose,
            "feedback": gemini_result.summary.feedback,
        }

        conflict_parts = []

        if gemini_result.detected_algorithm != identify_result.algo_name:
            conflict_parts.append(
                f"algo: minilm={identify_result.algo_name} gemini={gemini_result.detected_algorithm}"
            )
            identify_result = IdentifyResult(
                algo_name=gemini_result.detected_algorithm,
                score=identify_result.score,
                top_raw=identify_result.top_raw,
                top3=identify_result.top3,
            )

        if gemini_result.time_complexity is not None:
            if gemini_result.time_complexity != final_complexity:
                conflict_parts.append(
                    f"complexity: local={final_complexity} gemini={gemini_result.time_complexity}"
                )
                final_complexity = gemini_result.time_complexity
                complexity_source = "gemini"

        if conflict_parts:
            logger.info(
                "[gemini_conflict] %s | score=%.2f | task_id=%s",
                " | ".join(conflict_parts),
                identify_result.score,
                task_id,
            )

    algo_for_level1, fallback_reason = route_level1_decision(code, identify_result)

    if algo_for_level1 is None and identify_result.top_raw and fallback_reason != "no_template":
        is_rec_flag = ast_is_recursive(code)
        expected_struct = EXPECTED_STRUCTURE.get(identify_result.top_raw, "iterative")
        log_divergence(
            code=code,
            identify_result=identify_result,
            is_recursive=is_rec_flag,
            expected_struct=expected_struct,
            divergence_type=fallback_reason or "low_confidence",
        )

    have_level1 = False
    raw_trace_objects = [
        TraceEvent(
            tag=ev["tag"],
            local_vars=ev.get("local_vars", {}),
            global_vars=ev.get("global_vars", {}),
            dataSnapshot=ev.get("dataSnapshot", []),
            meta=ev.get("meta", {}),
        )
        for ev in execution_trace
    ]
    input_data = _extract_input_data(execution_trace)
    level1_result = build_level1_trace(algo_for_level1, raw_trace_objects, input_data, code=code) \
        if algo_for_level1 is not None else None
    raw_trace = execution_trace
    raw_index_map: list = []
    if level1_result is not None:
        level1_events, raw_index_map = level1_result
        execution_trace = [
            {
                "tag": ev.tag,
                "local_vars": ev.local_vars,
                "global_vars": ev.global_vars,
                "dataSnapshot": _to_linear_data(ev.dataSnapshot),
                "meta": ev.meta,
            }
            for ev in level1_events
        ]
        have_level1 = True

    # Persist history (best-effort, never raises)
    if user_id is not None and save_history:
        try:
            _save_history(
                user_id, code, identify_result, final_complexity, complexity_source, gemini_summary,
                have_level1=have_level1,
                execution_trace=execution_trace,
                is_truncated=is_truncated,
                raw_trace=raw_trace,
                raw_index_map=raw_index_map,
                call_graph=call_graph,
                cfg_graph=cfg_graph,
                stdout_events=stdout_events,
            )
        except Exception:
            logger.warning("Failed to save explore history for task %s", task_id, exc_info=True)

    task_queue.update_progress(task_id, STAGE_DONE, "Done")

    level1_eligible = algo_for_level1 is not None and identify_result.score >= 0.45
    top3_candidates = [{"name": name, "score": score} for name, score in identify_result.top3]

    return {
        "detected_algorithm": identify_result.algo_name,
        "confidence_score":   identify_result.score,
        "level1_eligible":    level1_eligible,
        "fallback_reason":    fallback_reason,
        "time_complexity": final_complexity if final_complexity != "unknown" else None,
        "analysis_source": complexity_source,
        "gemini_summary": gemini_summary,
        "have_level1": have_level1,
        "execution_trace": execution_trace,
        "raw_trace": raw_trace,
        "raw_index_map": raw_index_map,
        "call_graph": call_graph,
        "cfg_graph": cfg_graph,
        "is_truncated": is_truncated,
        "stdout_events": stdout_events,
        "top3_candidates": top3_candidates,
    }
