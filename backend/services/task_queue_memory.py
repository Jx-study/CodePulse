import uuid
import time
import queue as queue_mod
import threading
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone, timedelta

from services.task_queue import (
    STATUS_PENDING,
    STATUS_RUNNING,
    STATUS_COMPLETED,
    STATUS_FAILED,
    STATUS_INPUT_NEEDED,
    STAGE_SYNTAX_CHECK,
    STAGE_DONE
)

TASK_TTL_MINUTES = 5
CLEANUP_INTERVAL_SECONDS = 60
MAX_WORKERS = 4

class TaskQueue:
    def __init__(self):
        self._tasks: dict[str, dict] = {}
        self._queues: dict[str, queue_mod.SimpleQueue] = {}
        self._lock = threading.Lock()
        self._executor = ThreadPoolExecutor(max_workers=MAX_WORKERS)
        self._start_cleanup_thread()

    def submit(self, *args, **kwargs) -> str:
        from services.analysis_runner import _run_analysis  # lazy — breaks circular import
        task_id = str(uuid.uuid4())
        user_id = kwargs.get("user_id")
        with self._lock:
            self._tasks[task_id] = {
                "status": STATUS_PENDING,
                "progress": {"stage": STAGE_SYNTAX_CHECK, "message": "Checking syntax and starting sandbox…"},
                "result": None,
                "error": None,
                "user_id": user_id,
                "created_at": datetime.now(timezone.utc),
            }
            self._queues[task_id] = queue_mod.SimpleQueue()
        self._executor.submit(self._run, task_id, _run_analysis, args, kwargs)
        return task_id

    def owns_task(self, task_id: str, user_id: int) -> bool:
        with self._lock:
            task = self._tasks.get(task_id)
        return task is not None and task.get("user_id") == user_id

    def get_status(self, task_id: str) -> dict | None:
        with self._lock:
            task = self._tasks.get(task_id)
        if task is None:
            return None
        result = {
            "status": task["status"],
            "progress": task["progress"] if task["status"] == STATUS_RUNNING else None,
        }
        if task["status"] == STATUS_FAILED:
            result["error_detail"] = task.get("error")
        return result

    def get_result(self, task_id: str) -> dict | None:
        with self._lock:
            task = self._tasks.get(task_id)
        if task is None or task["status"] != STATUS_COMPLETED:
            return None
        return task["result"]

    def get_task(self, task_id: str) -> dict | None:
        with self._lock:
            task = self._tasks.get(task_id)
        if task is None:
            return None
        return {
            "status": task["status"],
            "progress": task["progress"] if task["status"] == STATUS_RUNNING else None,
            "result": task["result"],
            "error": task["error"],
        }

    def update_progress(self, task_id: str, stage: str, message: str) -> None:
        with self._lock:
            if task_id in self._tasks:
                self._tasks[task_id]["progress"] = {"stage": stage, "message": message}
            q = self._queues.get(task_id)
        if q is not None:
            q.put({"stage": stage, "message": message, "status": "running"})

    def stream_progress(self, task_id: str):
        """Generator: yields progress dicts until task completes or fails."""
        with self._lock:
            q = self._queues.get(task_id)
            task = self._tasks.get(task_id)
        # Task already done before SSE connects（input_needed 也算 terminal，須一併處理，
        # 否則晚連的 SSE client 會卡到 60s timeout）
        if task is not None and task["status"] in (STATUS_COMPLETED, STATUS_FAILED, STATUS_INPUT_NEEDED):
            if task["status"] == STATUS_INPUT_NEEDED:
                info = task.get("input_needed", {})
                yield {
                    "stage": STAGE_DONE,
                    "status": "input_needed",
                    "prompt": info.get("prompt", ""),
                    "input_index": info.get("input_index", 0),
                    "stdout_events": info.get("stdout_events", []),
                }
            else:
                yield {"stage": STAGE_DONE, "status": task["status"], "error": task.get("error")}
            return
        if q is None:
            return
        # First event: current stage
        with self._lock:
            current = self._tasks.get(task_id, {}).get("progress")
        if current:
            yield {**current, "status": "running"}
        while True:
            try:
                event = q.get(timeout=60)
            except queue_mod.Empty:
                # Client likely disconnected or task stalled; stop streaming
                break
            yield event
            if event.get("status") in ("completed", "failed", "input_needed"):
                break

    def _run(self, task_id: str, fn, args: tuple, kwargs: dict) -> None:
        from app import app as flask_app
        from services.analysis_runner import InputNeededSignal  # lazy — 避免循環 import
        with self._lock:
            if task_id in self._tasks:
                self._tasks[task_id]["status"] = STATUS_RUNNING
        try:
            with flask_app.app_context():
                result = fn(task_id, *args, **kwargs)
            with self._lock:
                if task_id in self._tasks:
                    self._tasks[task_id]["status"] = STATUS_COMPLETED
                    self._tasks[task_id]["result"] = result
                    self._tasks[task_id]["progress"] = {"stage": STAGE_DONE, "message": "Done"}
                q = self._queues.pop(task_id, None)
            if q is not None:
                q.put({"stage": STAGE_DONE, "status": "completed"})
        except InputNeededSignal as sig:
            # input_needed 是 terminal-but-not-completed 狀態，不能進 FAILED/COMPLETED 分支。
            with self._lock:
                if task_id in self._tasks:
                    self._tasks[task_id]["status"] = STATUS_INPUT_NEEDED
                    self._tasks[task_id]["input_needed"] = {
                        "prompt": sig.prompt,
                        "input_index": sig.input_index,
                        "stdout_events": sig.stdout_events,
                    }
                q = self._queues.pop(task_id, None)
            if q is not None:
                q.put({
                    "stage": STAGE_DONE,
                    "status": "input_needed",
                    "prompt": sig.prompt,
                    "input_index": sig.input_index,
                    "stdout_events": sig.stdout_events,
                })
        except Exception as e:
            with self._lock:
                if task_id in self._tasks:
                    self._tasks[task_id]["status"] = STATUS_FAILED
                    self._tasks[task_id]["error"] = str(e)
                q = self._queues.pop(task_id, None)
            if q is not None:
                q.put({"stage": STAGE_DONE, "status": "failed", "error": str(e)})

    def _start_cleanup_thread(self) -> None:
        def cleanup():
            while True:
                time.sleep(CLEANUP_INTERVAL_SECONDS)
                cutoff = datetime.now(timezone.utc) - timedelta(minutes=TASK_TTL_MINUTES)
                with self._lock:
                    expired = [
                        tid for tid, task in self._tasks.items()
                        if task["created_at"] < cutoff
                    ]
                    for tid in expired:
                        del self._tasks[tid]
                        self._queues.pop(tid, None)

        t = threading.Thread(target=cleanup, daemon=True)
        t.start()


task_queue = TaskQueue()
