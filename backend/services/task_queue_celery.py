import json
import os
import redis as redis_lib
from celery.result import AsyncResult
from celery_app import celery_app  # noqa: F401 — ensures celery_app is configured
from services.task_queue import STAGE_DONE

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

    def submit(self, *args, user_id: int | None = None, **kwargs) -> str:
        """Submit an analysis task. Always dispatches run_analysis_task; fn routing is not supported."""
        from services.analysis_runner import run_analysis_task  # lazy — breaks circular import
        async_result = run_analysis_task.delay(*args, user_id=user_id, **kwargs)
        return async_result.id

    def update_progress(self, task_id: str, stage: str, message: str) -> None:
        key = f"task:{task_id}:progress"
        self._redis.hset(key, mapping={"stage": stage, "message": message})
        self._redis.expire(key, PROGRESS_TTL)
        channel = f"task:{task_id}:events"
        status = "completed" if stage == STAGE_DONE else "running"
        self._redis.publish(channel, json.dumps({"stage": stage, "message": message, "status": status}))

    def stream_progress(self, task_id: str):
        """Generator: yields progress dicts until task completes or fails."""
        ar = AsyncResult(task_id, app=celery_app)
        current_state = _CELERY_STATE_MAP.get(ar.state, "pending")
        # Task already done before SSE connects
        if current_state in ("completed", "failed"):
            error = str(ar.result) if current_state == "failed" and ar.result else None
            yield {"stage": STAGE_DONE, "status": current_state, "error": error}
            return
        # First event: current progress from Redis hash
        raw = self._redis.hgetall(f"task:{task_id}:progress")
        if raw:
            yield {**raw, "status": "running"}
        # Subscribe before re-checking state to close the race window where the
        # task completes between the initial ar.state check and subscribe().
        pubsub = self._redis.pubsub()
        pubsub.subscribe(f"task:{task_id}:events")
        try:
            # Drain the subscribe-confirmation message
            pubsub.get_message()
            # Re-check in case task completed in the gap between ar.state and subscribe
            ar2 = AsyncResult(task_id, app=celery_app)
            state2 = _CELERY_STATE_MAP.get(ar2.state, "pending")
            if state2 in ("completed", "failed"):
                error = str(ar2.result) if state2 == "failed" and ar2.result else None
                yield {"stage": STAGE_DONE, "status": state2, "error": error}
                return
            # Poll with timeout so a missed sentinel doesn't block forever
            while True:
                msg = pubsub.get_message(timeout=5)
                if msg is None:
                    # No message in 5s — check if task finished without publishing
                    ar3 = AsyncResult(task_id, app=celery_app)
                    s = _CELERY_STATE_MAP.get(ar3.state, "pending")
                    if s in ("completed", "failed"):
                        error = str(ar3.result) if s == "failed" and ar3.result else None
                        yield {"stage": STAGE_DONE, "status": s, "error": error}
                        return
                    continue
                if msg["type"] != "message":
                    continue
                event = json.loads(msg["data"])
                yield event
                if event.get("status") in ("completed", "failed"):
                    break
        finally:
            pubsub.unsubscribe()
            pubsub.close()

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
