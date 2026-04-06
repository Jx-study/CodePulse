"""
task_queue.py — MVP 非同步 Task Queue

使用 ThreadPoolExecutor + in-memory dict。
TTL 5 分鐘，由背景清理執行緒自管理。

已知限制（MVP 可接受）：
- Flask 重啟後進行中任務遺失
- 無法水平擴展（任務綁定單一 process）
- 無持久化
"""

import uuid
import time
import threading
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone, timedelta
from typing import Callable, Any

TASK_TTL_MINUTES = 5
CLEANUP_INTERVAL_SECONDS = 60
MAX_WORKERS = 4

# 任務狀態
STATUS_PENDING = "pending"
STATUS_RUNNING = "running"
STATUS_COMPLETED = "completed"
STATUS_FAILED = "failed"

# 進度階段
STAGE_SYNTAX_CHECK = "syntax_check"
STAGE_SANDBOX = "sandbox"
STAGE_ANALYSIS = "analysis"
STAGE_GEMINI = "gemini"
STAGE_DONE = "done"


class TaskQueue:
    def __init__(self):
        self._tasks: dict[str, dict] = {}
        self._lock = threading.Lock()
        self._executor = ThreadPoolExecutor(max_workers=MAX_WORKERS)
        self._start_cleanup_thread()

    def submit(self, fn: Callable, *args, **kwargs) -> str:
        task_id = str(uuid.uuid4())
        with self._lock:
            self._tasks[task_id] = {
                "status": STATUS_PENDING,
                "progress": {"stage": STAGE_SYNTAX_CHECK, "message": "語法預檢與沙箱啟動中…"},
                "result": None,
                "error": None,
                "created_at": datetime.now(timezone.utc),
            }
        self._executor.submit(self._run, task_id, fn, args, kwargs)
        return task_id

    def get_status(self, task_id: str) -> dict | None:
        with self._lock:
            task = self._tasks.get(task_id)
        if task is None:
            return None
        return {
            "status": task["status"],
            "progress": task["progress"] if task["status"] == STATUS_RUNNING else None,
        }

    def get_result(self, task_id: str) -> dict | None:
        with self._lock:
            task = self._tasks.get(task_id)
        if task is None or task["status"] != STATUS_COMPLETED:
            return None
        return task["result"]

    def get_task(self, task_id: str) -> dict | None:
        """Atomically return status + result to avoid TOCTOU races in the result endpoint."""
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

    def _run(self, task_id: str, fn: Callable, args: tuple, kwargs: dict) -> None:
        with self._lock:
            if task_id in self._tasks:
                self._tasks[task_id]["status"] = STATUS_RUNNING
        try:
            result = fn(task_id, *args, **kwargs)
            with self._lock:
                if task_id in self._tasks:
                    self._tasks[task_id]["status"] = STATUS_COMPLETED
                    self._tasks[task_id]["result"] = result
                    self._tasks[task_id]["progress"] = {"stage": STAGE_DONE, "message": "完成"}
        except Exception as e:
            with self._lock:
                if task_id in self._tasks:
                    self._tasks[task_id]["status"] = STATUS_FAILED
                    self._tasks[task_id]["error"] = str(e)

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

        t = threading.Thread(target=cleanup, daemon=True)
        t.start()


# 單例，Flask app 共用
task_queue = TaskQueue()
