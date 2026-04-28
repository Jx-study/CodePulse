"""tests/test_container_pool.py — ContainerPool 單元測試（mock subprocess）"""

import pytest
from unittest.mock import patch, MagicMock

from sandbox_sidecar.container_pool import (
    ContainerDeadError,
    PooledContainer,
    PoolExhaustedError,
)


def test_pooled_container_defaults():
    c = PooledContainer(id="abc123")
    assert c.id == "abc123"
    assert c.in_use is False
    assert c.reuse_count == 0


def test_pool_exhausted_error_is_exception():
    assert issubclass(PoolExhaustedError, Exception)


def test_container_dead_error_is_exception():
    assert issubclass(ContainerDeadError, Exception)
    
@pytest.fixture
def mock_subprocess():
    """攔截所有 subprocess 呼叫，預設成功回應。"""
    with patch("sandbox_sidecar.container_pool.subprocess") as mock:
        mock.check_output.return_value = "fake-container-id\n"
        mock.run.return_value = MagicMock(returncode=0, stdout="", stderr="")
        yield mock


def test_init_cleans_up_zombie_containers(mock_subprocess):
    # 模擬掃到 2 個殭屍
    mock_subprocess.check_output.side_effect = [
        "zombie1\nzombie2\n",      # docker ps 回傳 2 個殭屍
        "new1", "new2", "new3",    # spawn 3 個新的
    ]
    from sandbox_sidecar.container_pool import ContainerPool

    ContainerPool(min_size=3, max_size=5)

    rm_calls = [
        c for c in mock_subprocess.run.call_args_list
        if c.args[0][:3] == ["docker", "rm", "-f"]
    ]
    assert len(rm_calls) == 1
    assert "zombie1" in rm_calls[0].args[0]
    assert "zombie2" in rm_calls[0].args[0]


def test_init_spawns_min_size_containers(mock_subprocess):
    mock_subprocess.check_output.side_effect = [
        "",                                  # 沒殭屍
        "id1", "id2", "id3", "id4", "id5",   # spawn 5 個
    ]
    from sandbox_sidecar.container_pool import ContainerPool

    pool = ContainerPool(min_size=5, max_size=10)

    assert len(pool.containers) == 5
    assert {c.id for c in pool.containers} == {"id1", "id2", "id3", "id4", "id5"}
    assert all(not c.in_use for c in pool.containers)


def test_spawn_uses_correct_docker_args(mock_subprocess):
    mock_subprocess.check_output.side_effect = ["", "id1"]
    from sandbox_sidecar.container_pool import ContainerPool

    ContainerPool(min_size=1, max_size=5)

    spawn_call = mock_subprocess.check_output.call_args_list[1]
    args = spawn_call.args[0]
    assert args[0:2] == ["docker", "run"]
    assert "-d" in args
    assert "--label" in args and "codepulse-pool=1" in args
    assert "--network" in args and "none" in args
    assert "--read-only" in args
    assert "--memory" in args and "128m" in args
    assert "--cpus" in args and "0.5" in args
    assert args[-3:] == ["codepulse-sandbox", "tail", "-f"] or "tail" in args


def test_spawn_retries_on_failure(mock_subprocess):
    """spawn 失敗 retry 3 次，全失敗才拋。"""
    import subprocess as real_sp
    mock_subprocess.check_output.side_effect = [
        "",  # cleanup ps
        real_sp.CalledProcessError(1, "docker"),
        real_sp.CalledProcessError(1, "docker"),
        real_sp.CalledProcessError(1, "docker"),
    ]
    mock_subprocess.CalledProcessError = real_sp.CalledProcessError

    from sandbox_sidecar.container_pool import ContainerPool

    with pytest.raises(RuntimeError, match="failed to spawn"):
        ContainerPool(min_size=1, max_size=5)
        

def test_acquire_returns_idle_container(mock_subprocess):
    mock_subprocess.check_output.side_effect = ["", "id1", "id2"]
    from sandbox_sidecar.container_pool import ContainerPool

    pool = ContainerPool(min_size=2, max_size=5)
    c = pool.acquire()

    assert c.in_use is True
    assert c.id in {"id1", "id2"}


def test_acquire_spawns_when_no_idle_and_under_max(mock_subprocess):
    mock_subprocess.check_output.side_effect = ["", "id1", "id2", "id3"]
    from sandbox_sidecar.container_pool import ContainerPool

    pool = ContainerPool(min_size=2, max_size=5)
    pool.acquire()
    pool.acquire()
    c3 = pool.acquire()

    assert len(pool.containers) == 3
    assert c3.id == "id3"


def test_release_marks_idle(mock_subprocess):
    mock_subprocess.check_output.side_effect = ["", "id1"]
    from sandbox_sidecar.container_pool import ContainerPool

    pool = ContainerPool(min_size=1, max_size=5)
    c = pool.acquire()
    pool.release(c)

    assert c.in_use is False
    assert c.reuse_count == 1


def test_release_increments_reuse_count(mock_subprocess):
    mock_subprocess.check_output.side_effect = ["", "id1"]
    from sandbox_sidecar.container_pool import ContainerPool

    pool = ContainerPool(min_size=1, max_size=5)
    c = pool.acquire()
    pool.release(c)
    c = pool.acquire()
    pool.release(c)

    assert c.reuse_count == 2


def test_acquire_timeout_raises_pool_exhausted(mock_subprocess):
    mock_subprocess.check_output.side_effect = ["", "id1"]
    from sandbox_sidecar.container_pool import ContainerPool, PoolExhaustedError

    pool = ContainerPool(min_size=1, max_size=1)
    pool.acquire()  # 唯一容器佔走

    with pytest.raises(PoolExhaustedError):
        pool.acquire(timeout=0.2)

def test_release_destroys_when_max_reuse_reached(mock_subprocess):
    mock_subprocess.check_output.side_effect = ["", "id1", "replacement"]
    from sandbox_sidecar.container_pool import ContainerPool

    pool = ContainerPool(min_size=1, max_size=5, max_reuse=3)
    c = pool.acquire()
    # 跑滿 3 次：第 3 次 release 後應該被銷毀
    for _ in range(2):
        pool.release(c)
        c = pool.acquire()
    pool.release(c)  # 第 3 次 release，reuse_count = 3 → destroy

    # 等背景 replenish thread 完成
    import time
    for _ in range(50):
        if "id1" not in {x.id for x in pool.containers} and len(pool.containers) >= 1:
            break
        time.sleep(0.05)

    ids = {x.id for x in pool.containers}
    assert "id1" not in ids
    assert "replacement" in ids


def test_mark_destroyed_removes_immediately(mock_subprocess):
    mock_subprocess.check_output.side_effect = ["", "id1", "replacement"]
    from sandbox_sidecar.container_pool import ContainerPool

    pool = ContainerPool(min_size=1, max_size=5)
    c = pool.acquire()
    pool.mark_destroyed(c)

    assert c not in pool.containers

    import time
    for _ in range(50):
        if any(x.id == "replacement" for x in pool.containers):
            break
        time.sleep(0.05)
    assert any(x.id == "replacement" for x in pool.containers)


def test_destroy_calls_docker_rm_force(mock_subprocess):
    mock_subprocess.check_output.side_effect = ["", "id1", "replacement"]
    from sandbox_sidecar.container_pool import ContainerPool

    pool = ContainerPool(min_size=1, max_size=5)
    c = pool.acquire()
    pool.mark_destroyed(c)

    import time
    time.sleep(0.3)  # 等背景 thread

    rm_calls = [
        call for call in mock_subprocess.run.call_args_list
        if call.args[0][:3] == ["docker", "rm", "-f"] and "id1" in call.args[0]
    ]
    assert len(rm_calls) >= 1
