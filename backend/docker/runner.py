"""
runner.py — Docker sandbox container 入口

- 從環境變數 CODE（base64）讀取用戶程式碼
- 循序執行 run_trace() 和 build_cfg()
- 結果序列化為 JSON 印至 stdout
- 例外時印 {"error": "<message>"}，不 raise
"""

import base64
import json
import os
import sys


def main():
    try:
        encoded = os.environ.get("CODE", "")
        if not encoded:
            print(json.dumps({"error": "missing CODE environment variable"}))
            sys.exit(1)

        code = base64.b64decode(encoded).decode("utf-8")

        from tracer import run_trace
        from cfg_builder import build_cfg

        trace_result = run_trace(code)

        try:
            cfg_graphs = build_cfg(code)
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
                    "entry": g.entry,
                }
                for name, g in cfg_graphs.items()
            }
        except Exception:
            cfg_graph_data = {}

        output = {
            "trace": [
                {
                    "tag": ev.tag,
                    "variables": ev.variables,
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
                    {"source": e.source, "target": e.target, "steps": e.steps}
                    for e in trace_result.call_graph.edges
                ],
                "root": trace_result.call_graph.root,
            },
            "cfg_graph": cfg_graph_data,
            "is_truncated": trace_result.is_truncated,
            "step_count": trace_result.step_count,
        }

        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({"error": f"{type(e).__name__}: {e}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
