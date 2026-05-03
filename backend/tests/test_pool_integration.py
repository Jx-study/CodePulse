"""
tests/test_pool_integration.py — ContainerPool 整合測試

需要 codepulse-sandbox image 已 build、docker daemon 可用。
跑：pytest tests/test_pool_integration.py -m integration -v
"""

import base64
import json
import subprocess
import time

import pytest

from sandbox_sidecar.container_pool import ContainerPool

pytestmark = pytest.mark.integration


def _exec_code(pool, code, timeout=5):
    container = pool.acquire(timeout=10)
    encoded = base64.b64encode(code.encode("utf-8")).decode("ascii")
    try:
        proc = subprocess.run(
            ["docker", "exec", "-e", f"CODE={encoded}", container.id,
             "python", "/sandbox/runner.py"],
            capture_output=True, text=True, timeout=timeout,
        )
        return proc
    finally:
        pool.release(container)


@pytest.fixture
def pool():
    p = ContainerPool(min_size=2, max_size=3, max_reuse=5)
    yield p
    for c in list(p.containers):
        subprocess.run(["docker", "rm", "-f", c.id], capture_output=True)


def test_min_size_containers_actually_running(pool):
    out = subprocess.check_output(
        ["docker", "ps", "--filter", "label=codepulse-pool=1", "--format", "{{.ID}}"],
        text=True,
    )
    running_ids = {line[:12] for line in out.strip().splitlines() if line}
    pool_short = {c.id[:12] for c in pool.containers}
    assert pool_short.issubset(running_ids)


def test_exec_returns_correct_result(pool):
    proc = _exec_code(pool, "print(1+1)")
    assert proc.returncode == 0
    result = json.loads(proc.stdout)
    assert "trace" in result


def test_two_runs_in_same_container_dont_pollute(pool):
    """同一容器跑兩次不同 code，state 互不影響。"""
    pool2 = ContainerPool(min_size=1, max_size=1, max_reuse=10)
    try:
        p1 = _exec_code(pool2, "x = 999\nprint(x)")
        p2 = _exec_code(pool2, "y = 1\nprint(y)")
        r1 = json.loads(p1.stdout)
        r2 = json.loads(p2.stdout)
        assert r1 != r2
    finally:
        for c in list(pool2.containers):
            subprocess.run(["docker", "rm", "-f", c.id], capture_output=True)


def test_replenish_after_destroy(pool):
    target = pool.containers[0]
    pool.mark_destroyed(target)

    deadline = time.monotonic() + 5
    while time.monotonic() < deadline:
        if len(pool.containers) >= pool.min_size and target not in pool.containers:
            break
        time.sleep(0.1)

    assert target not in pool.containers
    assert len(pool.containers) >= pool.min_size
