import logging
import ast as _ast
import concurrent.futures as _cf

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
from services.task_queue import (
    task_queue,
    STAGE_SANDBOX,
    STAGE_ANALYSIS,
    STAGE_GEMINI,
)

logger = logging.getLogger(__name__)

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


@celery_app.task(bind=True, name="analysis_runner.run_analysis")
def run_analysis_task(self, code: str, wrapped_code: str) -> dict:
    """Celery task: analysis main flow. task_id = self.request.id."""
    task_id = self.request.id
    return _run_analysis(task_id, code, wrapped_code)


def _run_analysis(task_id: str, code: str, wrapped_code: str) -> dict:
    task_queue.update_progress(task_id, STAGE_SANDBOX, "正在模擬執行並計算複雜度…")
    sandbox_result = run_in_sandbox(wrapped_code)

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
            identify_result = IdentifyResult(algo_name=None, score=0.0, top_raw="")
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

    task_queue.update_progress(task_id, STAGE_GEMINI, "Gemini 專家仲裁中…")
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
    level1_result = build_level1_trace(algo_for_level1, raw_trace_objects, input_data) \
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

    return {
        "detected_algorithm": identify_result.algo_name,
        "confidence_score":   identify_result.score,
        "level1_eligible":    algo_for_level1 is not None,
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
    }
