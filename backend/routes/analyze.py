import logging
from flask import Blueprint, jsonify, request
from auth_utils import login_required

logger = logging.getLogger(__name__)
from services.precheck import precheck_and_wrap
import services.analysis_runner  # noqa: F401 — registers Celery task
from services.analysis_runner import _run_analysis
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
