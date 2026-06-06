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
