"""
container_pool.py — Sandbox 長跑容器池

啟動時預熱 MIN_POOL_SIZE 個 codepulse-sandbox 容器（tail -f /dev/null），
請求到來時用 docker exec 注入 user code 執行，避免每次 docker run 的冷啟動。
容器累計重用 MAX_REUSE 次或執行 timeout 後丟棄並背景補回。
"""

from __future__ import annotations

import subprocess
import threading
import uuid
import time
from dataclasses import dataclass

POOL_LABEL = "codepulse-pool=1"
IMAGE_NAME = "codepulse-sandbox"
SPAWN_RETRIES = 3


class PoolExhaustedError(Exception):
    """Pool 滿載且 acquire 等待逾時。"""


class ContainerDeadError(Exception):
    """容器在 docker exec 期間死亡（被 OOM kill 或被外部移除）。"""


@dataclass
class PooledContainer:
    id: str
    in_use: bool = False
    reuse_count: int = 0

class ContainerPool:
    def __init__(self, min_size: int, max_size: int, max_reuse: int = 50):
        self.min_size = min_size
        self.max_size = max_size
        self.max_reuse = max_reuse

        self._lock = threading.Lock()
        self._cond = threading.Condition(self._lock)
        self.containers: list[PooledContainer] = []

        self._cleanup_zombies()
        for _ in range(min_size):
            self.containers.append(self._spawn())

    def _cleanup_zombies(self) -> None:
        """sidecar 重啟時清掉前一代留下的孤兒容器。"""
        try:
            out = subprocess.check_output(
                ["docker", "ps", "-aq", "--filter", f"label={POOL_LABEL}"],
                text=True, timeout=10,
            )
        except subprocess.SubprocessError:
            return
        ids = [line for line in out.strip().splitlines() if line]
        if ids:
            subprocess.run(["docker", "rm", "-f", *ids], capture_output=True, timeout=15)

    def _spawn(self) -> PooledContainer:
        """啟動一個新的長跑容器，回傳 PooledContainer。失敗 retry SPAWN_RETRIES 次。"""
        last_err: Exception | None = None
        for _ in range(SPAWN_RETRIES):
            try:
                cid = subprocess.check_output(
                    [
                        "docker", "run", "-d",
                        "--label", POOL_LABEL,
                        "--network", "none",
                        "--read-only", "--tmpfs", "/tmp",
                        "--user", "nobody",
                        "--memory", "128m", "--cpus", "0.5",
                        "--name", f"sandbox-{uuid.uuid4().hex[:8]}",
                        IMAGE_NAME,
                        "tail", "-f", "/dev/null",
                    ],
                    text=True, timeout=15,
                ).strip()
                return PooledContainer(id=cid)
            except subprocess.CalledProcessError as e:
                last_err = e
        raise RuntimeError(f"failed to spawn container after {SPAWN_RETRIES} retries: {last_err}")

    def acquire(self, timeout: float = 8.0) -> PooledContainer:
        """取得一個 idle 容器並標記為 in_use。Pool 滿載且超時 → PoolExhaustedError。"""
        with self._cond:
            deadline = None
            while True:
                for c in self.containers:
                    if not c.in_use:
                        c.in_use = True
                        return c

                if len(self.containers) < self.max_size:
                    new_c = self._spawn()
                    new_c.in_use = True
                    self.containers.append(new_c)
                    return new_c

                if deadline is None:
                    import time
                    deadline = time.monotonic() + timeout

                remaining = deadline - time.monotonic()
                if remaining <= 0 or not self._cond.wait(timeout=remaining):
                    raise PoolExhaustedError(
                        f"pool exhausted: all {self.max_size} containers busy, waited {timeout}s"
                    )

    def release(self, container: PooledContainer) -> None:
        """歸還容器到 pool。reuse_count 達 max_reuse 時改走 mark_destroyed（Task 4）。"""
        with self._cond:
            container.reuse_count += 1
            container.in_use = False
            self._cond.notify_all()
