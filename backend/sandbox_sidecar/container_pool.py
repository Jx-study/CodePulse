"""
container_pool.py — Sandbox 長跑容器池

啟動時預熱 MIN_POOL_SIZE 個 codepulse-sandbox 容器（tail -f /dev/null），
請求到來時用 docker exec 注入 user code 執行，避免每次 docker run 的冷啟動。
容器累計重用 MAX_REUSE 次或執行 timeout 後丟棄並背景補回。
"""

from __future__ import annotations

from dataclasses import dataclass


class PoolExhaustedError(Exception):
    """Pool 滿載且 acquire 等待逾時。"""


class ContainerDeadError(Exception):
    """容器在 docker exec 期間死亡（被 OOM kill 或被外部移除）。"""


@dataclass
class PooledContainer:
    """池中單一容器的狀態。"""

    id: str
    in_use: bool = False
    reuse_count: int = 0