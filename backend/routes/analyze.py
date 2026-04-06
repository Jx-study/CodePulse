from flask import Blueprint, jsonify, request
from services.precheck import precheck_and_wrap
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
    目前為 stub，後續任務 7/8/9 填入真實邏輯。
    """
    task_queue.update_progress(task_id, STAGE_SANDBOX, "正在模擬執行並計算複雜度…")
    # TODO(任務7): Docker 沙箱 + tracer

    task_queue.update_progress(task_id, STAGE_ANALYSIS, "演算法辨識中…")
    # TODO(任務8/9): Gemini + MiniLM 分析

    task_queue.update_progress(task_id, STAGE_GEMINI, "Gemini 專家仲裁中…")
    # TODO(任務8): Gemini 仲裁結果整合

    return {
        "detected_algorithm": None,
        "confidence_score": None,
        "time_complexity": None,
        "analysis_source": "gemini",
        "have_level1": False,
        "execution_trace": [],
        "call_graph": None,
        "is_truncated": False,
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
