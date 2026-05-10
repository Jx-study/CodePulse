import hashlib
import json
import logging
from flask import Blueprint, jsonify, request, g, Response, stream_with_context
from auth_utils import login_required
from models.explorer import ExploreHistory
from services.code_normalizer import normalize_code

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
    if _matches_existing_history(code, g.current_user_id):
        return jsonify({"duplicate": True}), 200

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


def _matches_existing_history(code: str, user_id: int) -> bool:
    normalized = normalize_code(code)
    if not normalized:
        return False

    current_hash = hashlib.sha256(normalized.encode()).hexdigest()
    history_codes = (
        ExploreHistory.query
        .with_entities(ExploreHistory.user_code)
        .filter_by(user_id=user_id)
        .all()
    )
    for (history_code,) in history_codes:
        history_normalized = normalize_code(history_code)
        if not history_normalized:
            continue
        history_hash = hashlib.sha256(history_normalized.encode()).hexdigest()
        if history_hash == current_hash:
            return True

    return False


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
