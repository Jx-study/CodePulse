"""tests/test_pool_concurrent.py — ContainerPool 並發行為測試（mock subprocess）"""

import threading
import time
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import MagicMock, patch

import pytest

from sandbox_sidecar.container_pool import ContainerPool, PoolExhaustedError


@pytest.fixture
def mock_subprocess():
    with patch("sandbox_sidecar.container_pool.subprocess") as mock:
        counter = {"n": 0}
        def fake_check_output(args, *a, **kw):
            if "ps" in args:
                return ""
            counter["n"] += 1
            return f"id-{counter['n']}"
        mock.check_output.side_effect = fake_check_output
        mock.run.return_value = MagicMock(returncode=0, stdout="", stderr="")
        yield mock


def _hold_and_release(pool, hold_seconds):
    c = pool.acquire(timeout=10)
    time.sleep(hold_seconds)
    pool.release(c)
    return c.id


def test_concurrent_acquire_within_max_all_succeed(mock_subprocess):
    pool = ContainerPool(min_size=3, max_size=5)
    with ThreadPoolExecutor(max_workers=5) as ex:
        futures = [ex.submit(_hold_and_release, pool, 0.1) for _ in range(5)]
        ids = [f.result(timeout=5) for f in futures]
    assert len(ids) == 5
    assert len(pool.containers) <= 5


def test_concurrent_overflow_waits_then_succeeds(mock_subprocess):
    """6 個請求灌進 max=3 的 pool — 全部成功（多餘的等別人 release）。"""
    pool = ContainerPool(min_size=2, max_size=3)
    with ThreadPoolExecutor(max_workers=6) as ex:
        futures = [ex.submit(_hold_and_release, pool, 0.2) for _ in range(6)]
        ids = [f.result(timeout=10) for f in futures]
    assert len(ids) == 6


def test_concurrent_overflow_exceeds_acquire_timeout_raises(mock_subprocess):
    """3 個 slow holder 佔住 max=3，第 4 個 acquire(timeout=0.3) 應拋 PoolExhaustedError。"""
    pool = ContainerPool(min_size=3, max_size=3)
    holders = [pool.acquire() for _ in range(3)]

    with pytest.raises(PoolExhaustedError):
        pool.acquire(timeout=0.3)

    for c in holders:
        pool.release(c)


def test_release_wakes_waiter(mock_subprocess):
    pool = ContainerPool(min_size=1, max_size=1)
    held = pool.acquire()

    waiter_result: list = []

    def waiter():
        c = pool.acquire(timeout=5)
        waiter_result.append(c.id)

    t = threading.Thread(target=waiter)
    t.start()
    time.sleep(0.2)  # 確保 waiter 已進入 wait
    pool.release(held)
    t.join(timeout=2)

    assert len(waiter_result) == 1
