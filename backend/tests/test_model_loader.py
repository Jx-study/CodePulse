import threading
import pytest
from unittest.mock import MagicMock
from services.algo_identification import model_loader


def _reset():
    model_loader._model = None
    model_loader._warmup_thread = None


def test_get_model_loads_once(monkeypatch):
    _reset()
    call_count = 0
    fake_model = MagicMock()

    def fake_st(name):
        nonlocal call_count
        call_count += 1
        return fake_model

    monkeypatch.setattr("services.algo_identification.model_loader.SentenceTransformer", fake_st)
    m1 = model_loader.get_model()
    m2 = model_loader.get_model()
    assert m1 is m2
    assert call_count == 1


def test_warmup_is_idempotent(monkeypatch):
    _reset()
    call_count = 0

    def fake_st(name):
        nonlocal call_count
        call_count += 1
        return MagicMock()

    monkeypatch.setattr("services.algo_identification.model_loader.SentenceTransformer", fake_st)
    model_loader.warmup()
    model_loader.warmup()
    if model_loader._warmup_thread:
        model_loader._warmup_thread.join(timeout=10)
    assert call_count == 1


def test_get_model_concurrent_loads_once(monkeypatch):
    _reset()
    call_count = 0

    def fake_st(name):
        nonlocal call_count
        call_count += 1
        return MagicMock()

    monkeypatch.setattr("services.algo_identification.model_loader.SentenceTransformer", fake_st)

    results = []

    def load():
        results.append(model_loader.get_model())

    threads = [threading.Thread(target=load) for _ in range(5)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert call_count == 1
    assert len(set(id(r) for r in results)) == 1  # all same object
