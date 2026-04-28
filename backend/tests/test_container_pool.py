"""tests/test_container_pool.py — ContainerPool 單元測試（mock subprocess）"""

import pytest

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