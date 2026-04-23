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
from tracer import run_trace
from cfg_builder import build_cfg, build_module_cfg


def main():
    # Redirect stdout so user print() calls don't corrupt the JSON output.
    # All JSON is written directly to the original stdout via sys.__stdout__.
    _real_stdout = sys.__stdout__
    sys.stdout = io.StringIO()

    try:
        encoded = os.environ.get("CODE", "")
        if not encoded:
            _real_stdout.write(json.dumps({"error": "missing CODE environment variable"}) + "\n")
            sys.exit(1)

        code = base64.b64decode(encoded).decode("utf-8")

        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            _real_stdout.write(json.dumps({"error": f"SyntaxError: {e}"}) + "\n")
            sys.exit(1)

        if not tree.body:
            _real_stdout.write(json.dumps({"error": "empty code: no executable statements found"}) + "\n")
            sys.exit(1)

        trace_result = run_trace(code)

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

        _real_stdout.write(json.dumps(output) + "\n")

    except Exception as e:
        _real_stdout.write(json.dumps({"error": f"{type(e).__name__}: {e}"}) + "\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
