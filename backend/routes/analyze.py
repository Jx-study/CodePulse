import json
import logging
from flask import Blueprint, jsonify, request, g, Response, stream_with_context
from auth_utils import login_required
from services.playground_history import MAX_HISTORY, has_history_capacity, matches_existing_history

logger = logging.getLogger(__name__)
from services.precheck import precheck_and_wrap
import services.analysis_runner  # noqa: F401 — side-effect import: executes @celery_app.task decorator to register run_analysis_task; do NOT remove
from services.task_queue import (
    task_queue,
    STATUS_COMPLETED,
    STATUS_FAILED,
    STATUS_PENDING,
    STATUS_RUNNING,
)

analyze_bp = Blueprint('analyze', __name__, url_prefix='/api/analyze')


@analyze_bp.route('/submit', methods=['POST'])
@login_required
def submit():
    """提交程式碼，回傳 task_id"""
    data = request.get_json(silent=True)
    if not data or "code" not in data:
        return jsonify({"error": "missing field: code"}), 400

    code = data["code"]
    save_history = data.get("save_history", True) is not False
    if save_history:
        if matches_existing_history(code, g.current_user_id):
            return jsonify({"duplicate": True}), 200
        if not has_history_capacity(g.current_user_id):
            return jsonify({
                "error": "history_quota_exceeded",
                "limit": MAX_HISTORY,
            }), 409

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

    task_id = task_queue.submit(
        code,
        wrapped_code,
        user_id=g.current_user_id,
        save_history=save_history,
    )
    return jsonify({"task_id": task_id}), 202

@analyze_bp.route('/status/<task_id>', methods=['GET'])
def status(task_id: str):
    """輪詢任務狀態（前端每 2 秒呼叫）"""
    task_status = task_queue.get_status(task_id)
    if task_status is None:
        return jsonify({"error": "task not found"}), 404
    return jsonify(task_status), 200


@analyze_bp.route('/stream/<task_id>', methods=['GET'])
@login_required
def stream(task_id: str):
    """SSE endpoint: streams progress events until task completes or fails."""
    if not task_queue.owns_task(task_id, g.current_user_id):
        return jsonify({"error": "task not found"}), 404

    def generate():
        for event in task_queue.stream_progress(task_id):
            yield f"data: {json.dumps(event)}\n\n"

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@analyze_bp.route('/result/<task_id>', methods=['GET'])
@login_required
def result(task_id: str):
    """取得分析結果（status = completed 後才有效）"""
    if not task_queue.owns_task(task_id, g.current_user_id):
        return jsonify({"error": "task not found"}), 404

    task = task_queue.get_task(task_id)
    if task is None:
        return jsonify({"error": "task not found"}), 404

    if task["status"] == STATUS_FAILED:
        return jsonify({"error": "analysis failed"}), 500

    if task["status"] in (STATUS_PENDING, STATUS_RUNNING):
        return jsonify({"status": task["status"], "message": "task not completed yet"}), 200

    return jsonify(task["result"]), 200
