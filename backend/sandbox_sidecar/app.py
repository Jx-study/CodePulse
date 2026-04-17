"""
sandbox_sidecar/app.py — Sandbox Sidecar

唯一有 /var/run/docker.sock 存取權的服務。
只接受一個 endpoint：POST /run，執行 codepulse-sandbox container。

安全設計：
- 不接受任意 docker 指令，只 hardcode docker run 參數
- 只監聽 container 內部網路（不對外暴露）
- 永遠不 raise，錯誤透過 JSON 回傳
"""

import base64
import json
import subprocess
from flask import Flask, request, jsonify

app = Flask(__name__)

CONTAINER_TIMEOUT = 10
IMAGE_NAME = "codepulse-sandbox"

_DOCKER_FLAGS = [
    "--rm",
    "--network", "none",
    "--read-only",
    "--tmpfs", "/tmp",
    "--user", "nobody",
    "--memory", "128m",
    "--cpus", "0.5",
]


@app.route("/run", methods=["POST"])
def run():
    data = request.get_json(silent=True)
    if not data or "code" not in data:
        return jsonify({"error": "missing field: code"}), 400

    code = data["code"]
    encoded = base64.b64encode(code.encode("utf-8")).decode("ascii")
    cmd = [
        "docker", "run",
        *_DOCKER_FLAGS,
        "-e", f"CODE={encoded}",
        IMAGE_NAME,
    ]

    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=CONTAINER_TIMEOUT,
        )
    except subprocess.TimeoutExpired:
        _try_kill_container()
        return jsonify({"error": "timeout", "is_truncated": True, "trace": [], "call_graph": None, "cfg_graph": {}})
    except FileNotFoundError as e:
        return jsonify({"error": f"docker not found: {e}", "is_truncated": False, "trace": [], "call_graph": None, "cfg_graph": {}})

    if proc.returncode != 0:
        try:
            payload = json.loads(proc.stdout)
            if "error" in payload:
                return jsonify({"error": payload["error"], "is_truncated": False, "trace": [], "call_graph": None, "cfg_graph": {}})
        except (json.JSONDecodeError, ValueError):
            pass
        stderr = proc.stderr.strip() if proc.stderr else ""
        return jsonify({"error": f"container exited with code {proc.returncode}: {stderr}", "is_truncated": False, "trace": [], "call_graph": None, "cfg_graph": {}})

    try:
        result = json.loads(proc.stdout)
    except json.JSONDecodeError:
        return jsonify({"error": f"invalid JSON from container: {proc.stdout[:200]}", "is_truncated": False, "trace": [], "call_graph": None, "cfg_graph": {}})

    return jsonify(result)


def _try_kill_container():
    try:
        result = subprocess.run(
            ["docker", "ps", "-q", "--filter", f"ancestor={IMAGE_NAME}"],
            capture_output=True, text=True, timeout=5,
        )
        for cid in result.stdout.strip().splitlines():
            subprocess.run(["docker", "kill", cid], capture_output=True, timeout=5)
    except Exception:
        pass


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
