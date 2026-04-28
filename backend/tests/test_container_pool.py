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