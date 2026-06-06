import base64
import json
import os
import subprocess
import sys


RUNNER_PATH = os.path.join(os.path.dirname(__file__), "..", "docker", "runner.py")
SERVICES_PATH = os.path.join(os.path.dirname(__file__), "..", "services")


def run_runner_interactive(code: str, inputs: list[str]) -> tuple[list[str], int]:
    env = os.environ.copy()
    env["PYTHONPATH"] = SERVICES_PATH
    env["CODE"] = base64.b64encode(code.encode()).decode()
    env["SANDBOX_CONTAINER"] = "1"
    env["CODEPULSE_INTERACTIVE"] = "1"

    proc = subprocess.Popen(
        [sys.executable, RUNNER_PATH],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env,
    )

    lines: list[str] = []
    try:
        for value in inputs:
            assert proc.stdout is not None
            line = proc.stdout.readline()
            if line:
                lines.append(line.rstrip("\n"))
            assert proc.poll() is None, "runner exited while waiting for interactive input"
            assert proc.stdin is not None
            proc.stdin.write(value + "\n")
            proc.stdin.flush()

        stdout_tail, _stderr = proc.communicate(timeout=15)
        lines.extend(line for line in stdout_tail.splitlines() if line)
    finally:
        if proc.poll() is None:
            proc.kill()

    return lines, proc.returncode


def run_runner_interactive_no_input(code: str) -> tuple[list[dict], int]:
    """互動模式下執行無 input() 的 code，回傳 (parsed_events, returncode)。

    重點：直接驗證真實 runner 在互動模式下的輸出協定。所有行都必須帶
    __CODEPULSE_EVENT__ 前綴（裸 JSON 會被 sidecar 誤判成 stdout，使用者拿不到錯誤）。
    """
    env = os.environ.copy()
    env["PYTHONPATH"] = SERVICES_PATH
    env["CODE"] = base64.b64encode(code.encode()).decode()
    env["SANDBOX_CONTAINER"] = "1"
    env["CODEPULSE_INTERACTIVE"] = "1"

    proc = subprocess.run(
        [sys.executable, RUNNER_PATH],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env,
        timeout=15,
    )

    events: list[dict] = []
    for line in proc.stdout.splitlines():
        if not line:
            continue
        # 互動模式下每一行都必須是 event；裸 JSON 代表 bug
        assert line.startswith("__CODEPULSE_EVENT__"), f"non-event line in interactive mode: {line!r}"
        events.append(json.loads(line.removeprefix("__CODEPULSE_EVENT__")))
    return events, proc.returncode


def test_runtime_error_emits_error_event_with_lineno():
    """互動模式下 runtime error 須以 error event 回傳，並帶 lineno（非裸 JSON）。"""
    code = "x = 1\ny = 1 / 0\n"
    events, rc = run_runner_interactive_no_input(code)

    assert rc == 1
    error_events = [ev for ev in events if ev["type"] == "error"]
    assert len(error_events) == 1
    err = error_events[0]
    assert "ZeroDivisionError" in err["message"]
    assert err["lineno"] == 2


def test_syntax_error_emits_error_event():
    """互動模式下 SyntaxError 也須以 error event 回傳。"""
    code = "def foo(:\n    pass\n"
    events, rc = run_runner_interactive_no_input(code)

    assert rc == 1
    error_events = [ev for ev in events if ev["type"] == "error"]
    assert len(error_events) == 1
    assert "SyntaxError" in error_events[0]["message"]


def test_runner_interactive_protocol_reuses_process_for_multiple_inputs():
    code = (
        'name = input("Name: ")\n'
        'age = input("Age: ")\n'
        'city = input("City: ")\n'
        'print(f"{name} {age} {city}")\n'
    )
    lines, rc = run_runner_interactive(code, ["Ada", "37", "Taipei"])

    assert rc == 0
    events = []
    for line in lines:
        assert line.startswith("__CODEPULSE_EVENT__")
        events.append(json.loads(line.removeprefix("__CODEPULSE_EVENT__")))

    assert [event["type"] for event in events[:3]] == [
        "input_needed",
        "input_needed",
        "input_needed",
    ]
    assert [event["prompt"] for event in events[:3]] == [
        "Name: ",
        "Age: ",
        "City: ",
    ]
    assert events[-1]["type"] == "result"
    assert [ev["text"] for ev in events[-1]["payload"]["stdout_events"]] == [
        "Name: Ada",
        "Age: 37",
        "City: Taipei",
        "Ada 37 Taipei",
    ]


def test_live_input_provider_is_not_included_in_user_trace():
    code = 'name = input("Name: ")\nprint(name)\n'
    lines, rc = run_runner_interactive(code, ["Ada"])

    assert rc == 0
    events = [
        json.loads(line.removeprefix("__CODEPULSE_EVENT__"))
        for line in lines
    ]
    result = events[-1]["payload"]
    func_names = {
        event["meta"]["func_name"]
        for event in result["trace"]
        if "meta" in event
    }

    assert "emit_event" not in func_names
    assert "dumps" not in func_names
    assert "decode" not in func_names
    assert result["stdout_events"] == [
        {"step": 2, "text": "Name: Ada"},
        {"step": 3, "text": "Ada"},
    ]
