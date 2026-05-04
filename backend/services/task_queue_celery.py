import os
import redis as redis_lib
from celery.result import AsyncResult
from celery_app import celery_app  # noqa: F401 — ensures celery_app is configured

PROGRESS_TTL = 300  # seconds, aligned with result_expires in celery_app.py

_CELERY_STATE_MAP = {
    "PENDING":  "pending",
    "RECEIVED": "pending",
    "STARTED":  "running",
    "RETRY":    "running",
    "SUCCESS":  "completed",
    "FAILURE":  "failed",
    "REVOKED":  "failed",
}


class CeleryTaskQueue:
    def __init__(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self._redis = redis_lib.from_url(redis_url, decode_responses=True)

    def submit(self, fn, *args, **kwargs) -> str:
        from services.analysis_runner import run_analysis_task  # lazy — breaks circular import
        async_result = run_analysis_task.delay(*args, **kwargs)
        return async_result.id

    def update_progress(self, task_id: str, stage: str, message: str) -> None:
        key = f"task:{task_id}:progress"
        self._redis.hset(key, mapping={"stage": stage, "message": message})
        self._redis.expire(key, PROGRESS_TTL)

    def get_status(self, task_id: str) -> dict | None:
        ar = AsyncResult(task_id, app=celery_app)
        status = _CELERY_STATE_MAP.get(ar.state, "pending")
        progress = None
        if status == "running":
            raw = self._redis.hgetall(f"task:{task_id}:progress")
            progress = raw if raw else None
        result = {"status": status, "progress": progress}
        if status == "failed":
            result["error_detail"] = str(ar.result) if ar.result else None
        return result

    def get_result(self, task_id: str) -> dict | None:
        ar = AsyncResult(task_id, app=celery_app)
        if _CELERY_STATE_MAP.get(ar.state) != "completed":
            return None
        return ar.result

    def get_task(self, task_id: str) -> dict | None:
        ar = AsyncResult(task_id, app=celery_app)
        status = _CELERY_STATE_MAP.get(ar.state, "pending")
        progress = None
        if status == "running":
            raw = self._redis.hgetall(f"task:{task_id}:progress")
            progress = raw if raw else None
        error = None
        result = None
        if status == "failed":
            error = str(ar.result) if ar.result else "unknown error"
        elif status == "completed":
            result = ar.result
        return {
            "status": status,
            "progress": progress,
            "result": result,
            "error": error,
        }


task_queue = CeleryTaskQueue()
