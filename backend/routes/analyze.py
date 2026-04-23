import logging
import concurrent.futures as _cf
from flask import Blueprint, jsonify, request

logger = logging.getLogger(__name__)
from services.precheck import precheck_and_wrap
from services.sandbox import run_in_sandbox
from services.ast_complexity import analyze_complexity
from services.complexity_analyzer import measure_step_counts
from services.tracer import TraceEvent
from services.template_tracer import build_level1_trace
from services.task_queue import (
    task_queue,
    STATUS_COMPLETED,
    STATUS_FAILED,
    STATUS_PENDING,
    STATUS_RUNNING,
    STAGE_SANDBOX,
    STAGE_ANALYSIS,
    STAGE_GEMINI,
)

analyze_bp = Blueprint('analyze', __name__, url_prefix='/api/analyze')


def _run_analysis(task_id: str, code: str, wrapped_code: str) -> dict:
    """
    分析主流程（在 ThreadPoolExecutor 中執行）。
    """
    task_queue.update_progress(task_id, STAGE_SANDBOX, "正在模擬執行並計算複雜度…")
    sandbox_result = run_in_sandbox(wrapped_code)

    if "error" in sandbox_result:
        error_msg = sandbox_result["error"]
        logger.error("sandbox error: %s", error_msg)
        if error_msg == "timeout":
            raise RuntimeError("timeout")
        raise RuntimeError(error_msg)
    else:
        execution_trace = sandbox_result.get("trace", [])
        call_graph = sandbox_result.get("call_graph")
        cfg_graph = sandbox_result.get("cfg_graph", {})
        is_truncated = sandbox_result.get("is_truncated", False)
        stdout_events = sandbox_result.get("stdout_events", [])

    task_queue.update_progress(task_id, STAGE_ANALYSIS, "正在分析時間複雜度…")
    ast_complexity = "unknown"
    bigo_complexity = "unknown"
    with _cf.ThreadPoolExecutor(max_workers=2) as _pool:
        _ast_fut = _pool.submit(analyze_complexity, code)
        _bigo_fut = _pool.submit(measure_step_counts, wrapped_code)
        try:
            ast_complexity = _ast_fut.result(timeout=60)
        except Exception:
            ast_complexity = "unknown"
        try:
            bigo_complexity = _bigo_fut.result(timeout=60)
        except Exception:
            bigo_complexity = "unknown"

    if (ast_complexity != "unknown"
            and bigo_complexity != "unknown"
            and ast_complexity == bigo_complexity):
        final_complexity = ast_complexity
        complexity_source = "ast+bigO"
    else:
        final_complexity = "unknown"
        complexity_source = "gemini"

    task_queue.update_progress(task_id, STAGE_GEMINI, "Gemini 專家仲裁中…")
    # TODO: Gemini 仲裁結果整合

    # Level 1 trace：hardcode bubble_sort，嘗試升級語意 trace
    have_level1 = False
    import ast as _ast

    def _extract_input_data(trace_events: list) -> list | None:
        """從 trace 的 CALL event local_vars 取出第一個 list 型態的參數。"""
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
    level1_result = build_level1_trace("bubble_sort", raw_trace_objects, input_data)
    raw_trace = execution_trace  # 保留原始 trace 給 Call Stack / local_vars 面板使用
    raw_index_map: list = []
    if level1_result is not None:
        level1_events, raw_index_map = level1_result

        def _to_linear_data(snapshot: list) -> list:
            """把 [3,1,2] 轉成前端 LinearData 格式 [{id:"0",value:3},...]。"""
            return [{"id": str(i), "value": v} for i, v in enumerate(snapshot)]

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
        "detected_algorithm": "bubble_sort" if have_level1 else None,  # TODO: 接 Gemini 後移除 hardcode
        "confidence_score": None,
        "time_complexity": final_complexity if final_complexity != "unknown" else None,
        "analysis_source": complexity_source,
        "have_level1": have_level1,
        "execution_trace": execution_trace,
        "raw_trace": raw_trace,
        "raw_index_map": raw_index_map,
        "call_graph": call_graph,
        "cfg_graph": cfg_graph,
        "is_truncated": is_truncated,
        "stdout_events": stdout_events,
    }


@analyze_bp.route('/submit', methods=['POST'])
def submit():
    """提交程式碼，回傳 task_id"""
    data = request.get_json(silent=True)
    if not data or "code" not in data:
        return jsonify({"error": "missing field: code"}), 400

    code = data["code"]

    try:
        wrapped_code, _ = precheck_and_wrap(code)
    except ValueError as e:
        return jsonify({"error": "empty_code", "message": str(e)}), 422
    except SyntaxError as e:
        return jsonify({
            "error": "syntax_error",
            "message": str(e.msg),
            "lineno": e.lineno,
        }), 422

    task_id = task_queue.submit(_run_analysis, code, wrapped_code)
    return jsonify({"task_id": task_id}), 202


@analyze_bp.route('/status/<task_id>', methods=['GET'])
def status(task_id: str):
    """輪詢任務狀態（前端每 2 秒呼叫）"""
    task_status = task_queue.get_status(task_id)
    if task_status is None:
        return jsonify({"error": "task not found"}), 404
    return jsonify(task_status), 200


@analyze_bp.route('/result/<task_id>', methods=['GET'])
def result(task_id: str):
    """取得分析結果（status = completed 後才有效）"""
    task = task_queue.get_task(task_id)
    if task is None:
        return jsonify({"error": "task not found"}), 404

    if task["status"] == STATUS_FAILED:
        return jsonify({"error": "analysis failed"}), 500

    if task["status"] in (STATUS_PENDING, STATUS_RUNNING):
        return jsonify({"status": task["status"], "message": "task not completed yet"}), 200

    return jsonify(task["result"]), 200
