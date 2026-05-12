import json
import os
import time

import redis as redis_lib
from celery.result import AsyncResult

from celery_app import celery_app  # noqa: F401 - ensures celery_app is configured
from services.task_queue import STAGE_DONE

PROGRESS_TTL = 300  # seconds, aligned with result_expires in celery_app.py
PROGRESS_STREAM_MAX_SECONDS = PROGRESS_TTL

_CELERY_STATE_MAP = {
    "PENDING": "pending",
    "RECEIVED": "pending",
    "STARTED": "running",
    "RETRY": "running",
    "SUCCESS": "completed",
    "FAILURE": "failed",
    "REVOKED": "failed",
}


def _terminal_event(ar: AsyncResult, status: str) -> dict:
    error = str(ar.result) if status == "failed" and ar.result else None
    return {"stage": STAGE_DONE, "status": status, "error": error}


class CeleryTaskQueue:
    def __init__(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self._redis = redis_lib.from_url(redis_url, decode_responses=True)

    def submit(
        self,
        *args,
        user_id: int | None = None,
        save_history: bool = True,
        **kwargs,
    ) -> str:
        """Submit an analysis task. Always dispatches run_analysis_task; fn routing is not supported."""
        from services.analysis_runner import run_analysis_task  # lazy - breaks circular import

        async_result = run_analysis_task.apply_async(
            args=args,
            kwargs={"user_id": user_id, "save_history": save_history, **kwargs},
        )
        if user_id is not None:
            try:
                self._redis.setex(f"task:{async_result.id}:owner", PROGRESS_TTL, str(user_id))
            except redis_lib.RedisError:
                pass
        return async_result.id

    def owns_task(self, task_id: str, user_id: int) -> bool:
        try:
            owner_id = self._redis.get(f"task:{task_id}:owner")
        except redis_lib.RedisError:
            return False
        return owner_id == str(user_id)

    def update_progress(self, task_id: str, stage: str, message: str) -> None:
        key = f"task:{task_id}:progress"
        self._redis.hset(key, mapping={"stage": stage, "message": message})
        self._redis.expire(key, PROGRESS_TTL)
        channel = f"task:{task_id}:events"
        self._redis.publish(
            channel,
            json.dumps({"stage": stage, "message": message, "status": "running"}),
        )

    def stream_progress(self, task_id: str):
        """Generator: yields progress dicts until task completes, fails, or times out."""
        ar = AsyncResult(task_id, app=celery_app)
        current_state = _CELERY_STATE_MAP.get(ar.state, "pending")
        if current_state in ("completed", "failed"):
            yield _terminal_event(ar, current_state)
            return

        raw = self._redis.hgetall(f"task:{task_id}:progress")
        if raw:
            yield {**raw, "status": "running"}

        pubsub = self._redis.pubsub()
        pubsub.subscribe(f"task:{task_id}:events")
        try:
            pubsub.get_message()

            ar2 = AsyncResult(task_id, app=celery_app)
            state2 = _CELERY_STATE_MAP.get(ar2.state, "pending")
            if state2 in ("completed", "failed"):
                yield _terminal_event(ar2, state2)
                return

            started_at = time.monotonic()
            while True:
                msg = pubsub.get_message(timeout=5)
                if msg is None:
                    if time.monotonic() - started_at >= PROGRESS_STREAM_MAX_SECONDS:
                        yield {
                            "stage": STAGE_DONE,
                            "status": "failed",
                            "error": "task stream timed out",
                        }
                        return
                    ar3 = AsyncResult(task_id, app=celery_app)
                    s = _CELERY_STATE_MAP.get(ar3.state, "pending")
                    if s in ("completed", "failed"):
                        yield _terminal_event(ar3, s)
                        return
                    continue
                if msg["type"] != "message":
                    continue
                event = json.loads(msg["data"])
                if event.get("stage") == STAGE_DONE:
                    ar4 = AsyncResult(task_id, app=celery_app)
                    s = _CELERY_STATE_MAP.get(ar4.state, "pending")
                    if s in ("completed", "failed"):
                        yield _terminal_event(ar4, s)
                        return
                    continue
                yield event
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
