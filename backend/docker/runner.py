"""
runner.py — Docker sandbox container 入口

- 從環境變數 CODE（base64）讀取用戶程式碼
- 循序執行 run_trace() 和 build_cfg()
- 結果序列化為 JSON 印至 stdout
- 例外時印 {"error": "<message>"}，不 raise
"""

import ast
import base64
import io
import json
import os
import sys
import traceback as _traceback
from tracer import run_trace, LegacyInputNeededError
from cfg_builder import build_cfg, build_module_cfg

EVENT_PREFIX = "__CODEPULSE_EVENT__"


def emit_event(event_type: str, **payload):
    sys.__stdout__.write(
        EVENT_PREFIX + json.dumps({"type": event_type, **payload}) + "\n"
    )
    sys.__stdout__.flush()


def main():
    # Redirect stdout so user print() calls don't corrupt the JSON output.
    # All JSON is written directly to the original stdout via sys.__stdout__.
    _real_stdout = sys.__stdout__
    sys.stdout = io.StringIO()

    interactive_enabled = os.environ.get("CODEPULSE_INTERACTIVE") == "1"

    def _emit_error(message: str, *, lineno: int | None = None):
        # 互動模式（生產環境一律如此）下，所有輸出都必須帶 EVENT_PREFIX，否則 sidecar 的
        # reader 會把這行誤判成 stdout，control-event 迴圈等不到 error → 走 timeout fallback
        # → 使用者看到「runner exited without result」而非真正的錯誤訊息。
        # 非互動模式（test_runner.py 走 subprocess 不帶旗標）維持裸 JSON。
        if interactive_enabled:
            payload = {"message": message}
            if lineno is not None:
                payload["lineno"] = lineno
            emit_event("error", **payload)
        else:
            body = {"error": message}
            if lineno is not None:
                body["lineno"] = lineno
            _real_stdout.write(json.dumps(body) + "\n")

    try:
        encoded = os.environ.get("CODE", "")
        if not encoded:
            _emit_error("missing CODE environment variable")
            sys.exit(1)

        code = base64.b64decode(encoded).decode("utf-8")

        stdin_raw = os.environ.get("STDIN_INPUTS", "")
        if stdin_raw:
            try:
                stdin_inputs = json.loads(base64.b64decode(stdin_raw).decode("utf-8"))
                if not isinstance(stdin_inputs, list) or not all(isinstance(v, str) for v in stdin_inputs):
                    stdin_inputs = []
            except Exception:
                stdin_inputs = []
        else:
            stdin_inputs = []

        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            _emit_error(f"SyntaxError: {e}", lineno=e.lineno)
            sys.exit(1)

        if not tree.body:
            _emit_error("empty code: no executable statements found")
            sys.exit(1)

        def _live_input(prompt: str, input_index: int, _stdout_events: list[dict]) -> str:
            emit_event("input_needed", prompt=prompt, input_index=input_index)
            line = sys.__stdin__.readline()
            if line == "":
                raise EOFError("stdin closed while waiting for input")
            return line.rstrip("\n")

        try:
            trace_result = run_trace(
                code,
                stdin_inputs=stdin_inputs,
                input_provider=_live_input if interactive_enabled else None,
            )
        except LegacyInputNeededError as e:
            """
            [LEGACY — re-submit fallback only] 結構化控制流訊號，不是 error 寫到 _real_stdout 而非 print
            exit 0 因為這不是 failure，是「需要更多輸入」的暫停
            前端會 append 輸入後重送整段 code live session 模式走 _live_input，不會走到這裡
            """
            _real_stdout.write(json.dumps({
                "error": "input_needed",
                "prompt": e.prompt,
                "input_index": e.input_index,
                "stdout_events": e.stdout_events,
            }) + "\n")
            sys.exit(0)

        try:
            cfg_graphs = build_cfg(code)
            module_cfg = build_module_cfg(code)
            if module_cfg.nodes:
                cfg_graphs["<global>"] = module_cfg
            cfg_graph_data = {
                name: {
                    "nodes": [
                        {"id": n.id, "kind": n.kind, "label": n.label, "lines": n.lines}
                        for n in g.nodes
                    ],
                    "edges": [
                        {"source": e.source, "target": e.target, "label": e.label}
                        for e in g.edges
                    ],
                }
                for name, g in cfg_graphs.items()
            }
        except Exception:
            cfg_graph_data = {}

        output = {
            "trace": [
                {
                    "tag": ev.tag,
                    "local_vars": ev.local_vars,
                    "global_vars": ev.global_vars,
                    "dataSnapshot": ev.dataSnapshot,
                    "meta": ev.meta,
                }
                for ev in trace_result.trace
            ],
            "call_graph": {
                "nodes": [
                    {"id": n.id, "func_name": n.func_name, "cfg": None}
                    for n in trace_result.call_graph.nodes
                ],
                "edges": [
                    {"source": e.source, "target": e.target, "steps": e.steps, "return_steps": e.return_steps}
                    for e in trace_result.call_graph.edges
                ],
                "root": trace_result.call_graph.root,
            },
            "cfg_graph": cfg_graph_data,
            "is_truncated": trace_result.is_truncated,
            "step_count": trace_result.step_count,
            "stdout_events": trace_result.stdout_events,
        }

        if interactive_enabled:
            emit_event("result", payload=output)
        else:
            _real_stdout.write(json.dumps(output) + "\n")

    except Exception as e:
        tb = _traceback.extract_tb(e.__traceback__)
        # Find the innermost frame that belongs to user code (exec'd as "<string>")
        user_frame = next((f for f in reversed(tb) if f.filename == "<string>"), None)
        error_lineno = user_frame.lineno if user_frame else (tb[-1].lineno if tb else None)
        _emit_error(f"{type(e).__name__}: {e}", lineno=error_lineno)
        sys.exit(1)


if __name__ == "__main__":
    main()
