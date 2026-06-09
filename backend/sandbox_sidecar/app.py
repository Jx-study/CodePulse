"""
sandbox_sidecar/app.py — Sandbox Sidecar

唯一有 /var/run/docker.sock 存取權的服務。
只接受一個 endpoint：POST /run，從 ContainerPool 取容器執行 user code。

安全設計：
- 不接受任意 docker 指令，只 hardcode docker exec 參數
- 容器靠 image build 時的 --network none / --read-only / --user nobody 隔離
- 永遠不 raise，錯誤透過 JSON 回傳
"""

import base64
import json
import logging
import os
import queue
import subprocess
import threading
import time
import uuid
from dataclasses import dataclass, field
from flask import Flask, request, jsonify

from container_pool import (
    ContainerDeadError,
    ContainerPool,
    PoolExhaustedError,
)

app = Flask(__name__)
logger = logging.getLogger(__name__)

CONTAINER_TIMEOUT = int(os.environ.get("CONTAINER_TIMEOUT", "10"))
ACQUIRE_TIMEOUT = float(os.environ.get("ACQUIRE_TIMEOUT", "8"))
MIN_POOL_SIZE = int(os.environ.get("MIN_POOL_SIZE", "10"))
MAX_POOL_SIZE = int(os.environ.get("MAX_POOL_SIZE", "30"))
MAX_REUSE = int(os.environ.get("MAX_REUSE", "50"))

_pool: ContainerPool | None = None
_pool_lock = threading.Lock()
EVENT_PREFIX = "__CODEPULSE_EVENT__"


@dataclass
class SandboxSession:
    id: str
    process: subprocess.Popen
    container: object
    pool: ContainerPool
    events: queue.Queue = field(default_factory=queue.Queue)
    stderr_lines: list[str] = field(default_factory=list)
    started_at: float = field(default_factory=time.monotonic)
    last_active_at: float = field(default_factory=time.monotonic)
    effective_timeout: float = CONTAINER_TIMEOUT
    input_count: int = 0
    closed: bool = False
    lock: threading.Lock = field(default_factory=threading.Lock)


_sessions: dict[str, SandboxSession] = {}
_sessions_lock = threading.Lock()


def _get_pool() -> ContainerPool:
    """Lazy-init ContainerPool（double-checked locking）— 第一次 /run 才開始預熱容器。"""
    global _pool
    if _pool is None:
        with _pool_lock:
            if _pool is None:
                _pool = ContainerPool(
                    min_size=MIN_POOL_SIZE,
                    max_size=MAX_POOL_SIZE,
                    max_reuse=MAX_REUSE,
                )
    return _pool


def _error_response(message: str, *, status: int = 200, lineno: int | None = None):
    body = {
        "error": message,
        "is_truncated": False,
        "trace": [],
        "call_graph": None,
        "cfg_graph": {},
    }
    if lineno is not None:
        body["lineno"] = lineno
    return jsonify(body), status


def _reader_stdout(session: SandboxSession) -> None:
    for raw_line in iter(session.process.stdout.readline, ""):
        line = raw_line.rstrip("\n")
        if not line:
            continue
        if line.startswith(EVENT_PREFIX):
            try:
                event = json.loads(line[len(EVENT_PREFIX):])
            except json.JSONDecodeError:
                session.events.put({"type": "error", "message": f"invalid protocol event: {line[:120]}"})
                continue
            session.events.put(event)
        else:
            # 互動模式下 runner 的所有輸出都應帶 EVENT_PREFIX；裸 stdout 代表協定外的東西
            # （import 期 warning、第三方 lib 直寫 stdout、runner 未來漏改的 error 路徑）。
            # _wait_for_control_event 只認 control event，這類行不會被消費 → 卡在 queue 裡，
            # 是隱性 debug 陷阱。至少留下可觀測性。
            # TODO(observability): 接 Sentry／結構化告警，目前僅 logger.warning。
            logger.warning("sidecar session %s: unexpected non-event stdout: %s", session.id, line[:200])
            session.events.put({"type": "stdout", "text": line})


def _reader_stderr(session: SandboxSession) -> None:
    for raw_line in iter(session.process.stderr.readline, ""):
        line = raw_line.rstrip("\n")
        if line:
            session.stderr_lines.append(line)
            if len(session.stderr_lines) > 200:
                session.stderr_lines = session.stderr_lines[-200:]


def _start_readers(session: SandboxSession) -> None:
    threading.Thread(target=_reader_stdout, args=(session,), daemon=True).start()
    threading.Thread(target=_reader_stderr, args=(session,), daemon=True).start()


def _store_session(session: SandboxSession) -> None:
    with _sessions_lock:
        _sessions[session.id] = session


def _pop_session(session_id: str) -> SandboxSession | None:
    with _sessions_lock:
        return _sessions.pop(session_id, None)


def _get_session(session_id: str) -> SandboxSession | None:
    with _sessions_lock:
        return _sessions.get(session_id)


def _finish_session(session: SandboxSession, *, recycle: bool) -> None:
    with session.lock:
        if session.closed:
            return
        session.closed = True
    _pop_session(session.id)
    if session.process.poll() is None:
        try:
            session.process.kill()
        except Exception:
            pass
    if recycle:
        session.pool.mark_destroyed(session.container)
    else:
        session.pool.release(session.container)


def _wait_for_control_event(session: SandboxSession, timeout: float):
    deadline = time.monotonic() + timeout
    while True:
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            return {"type": "error", "message": "timeout"}
        try:
            event = session.events.get(timeout=min(remaining, 0.5))
        except queue.Empty:
            if session.process.poll() is not None:
                stderr = "\n".join(session.stderr_lines).strip()
                return {"type": "error", "message": stderr or "runner exited without result"}
            continue

        event_type = event.get("type")
        if event_type in {"input_needed", "result", "error"}:
            session.last_active_at = time.monotonic()
            return event


def _event_to_response(session: SandboxSession, event: dict):
    event_type = event.get("type")
    if event_type == "input_needed":
        session.input_count += 1
        _store_session(session)
        return jsonify({
            "status": "input_needed",
            "session_id": session.id,
            "prompt": event.get("prompt", ""),
            "input_index": event.get("input_index", session.input_count - 1),
        })
    if event_type == "result":
        result = event.get("payload", {})
        _finish_session(session, recycle=session.input_count > 0)
        if session.input_count > 0:
            return jsonify({"status": "completed", "result": result})
        return jsonify(result)

    message = event.get("message", "sandbox error")
    lineno = event.get("lineno")
    should_recycle = session.input_count > 0 or message == "timeout"
    _finish_session(session, recycle=should_recycle)
    if session.input_count > 0:
        body = {"status": "failed", "error": message}
        if lineno is not None:
            body["lineno"] = lineno
        return jsonify(body)
    return _error_response(message, lineno=lineno)


@app.route("/run", methods=["POST"])
def run():
    data = request.get_json(silent=True)
    if not data or "code" not in data:
        return jsonify({"error": "missing field: code"}), 400

    code = data["code"]
    n = data.get("n")
    per_n_timeout = data.get("per_n_timeout")

    stdin_inputs = data.get("stdin_inputs", [])
    if not isinstance(stdin_inputs, list) or not all(isinstance(v, str) for v in stdin_inputs):
        return jsonify({"error": "stdin_inputs must be list[str]"}), 400

    runnable = code if n is None else code + f"\nexplore_wrapper({n})"
    encoded = base64.b64encode(runnable.encode("utf-8")).decode("ascii")
    # stdin 比照 CODE 用 base64 編碼，避開 shell/env 跳脫問題；runner.py 會解碼 STDIN_INPUTS。
    stdin_encoded = base64.b64encode(json.dumps(stdin_inputs).encode("utf-8")).decode("ascii")
    effective_timeout = per_n_timeout if per_n_timeout is not None else CONTAINER_TIMEOUT

    pool = _get_pool()

    try:
        container = pool.acquire(timeout=ACQUIRE_TIMEOUT)
    except PoolExhaustedError:
        return _error_response(
            "pool_exhausted: 伺服器繁忙，請稍後再試",
            status=503,
        )

    try:
        proc = subprocess.Popen(
            [
                "docker", "exec", "-i",
                "-e", f"CODE={encoded}",
                "-e", f"STDIN_INPUTS={stdin_encoded}",
                "-e", "CODEPULSE_INTERACTIVE=1",
                container.id,
                "python", "/sandbox/runner.py",
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
        )
    except FileNotFoundError as e:
        pool.release(container)
        return _error_response(f"docker not found: {e}")

    session = SandboxSession(
        id=uuid.uuid4().hex,
        process=proc,
        container=container,
        pool=pool,
        effective_timeout=effective_timeout,
    )
    _start_readers(session)
    event = _wait_for_control_event(session, effective_timeout)
    return _event_to_response(session, event)


@app.route("/input/<session_id>", methods=["POST"])
def post_input(session_id: str):
    session = _get_session(session_id)
    if session is None or session.closed:
        return jsonify({"status": "failed", "error": "session not found"}), 404

    data = request.get_json(silent=True) or {}
    value = data.get("value")
    if not isinstance(value, str):
        return jsonify({"status": "failed", "error": "value must be a string"}), 400

    try:
        with session.lock:
            session.process.stdin.write(value + "\n")
            session.process.stdin.flush()
            event = _wait_for_control_event(session, session.effective_timeout)
    except Exception as e:
        _finish_session(session, recycle=True)
        return jsonify({"status": "failed", "error": f"failed to send input: {e}"}), 500

    return _event_to_response(session, event)


@app.route("/session/<session_id>/alive", methods=["GET"])
def session_alive(session_id: str):
    session = _get_session(session_id)
    if session is None or session.closed:
        return jsonify({"status": "failed", "alive": False, "error": "session not found"}), 404
    alive = session.process.poll() is None
    status = "alive" if alive else "failed"
    return jsonify({"status": status, "alive": alive})


@app.route("/session/<session_id>/close", methods=["POST", "DELETE"])
def close_session(session_id: str):
    session = _get_session(session_id)
    if session is not None:
        _finish_session(session, recycle=True)
    return jsonify({"status": "closed"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
