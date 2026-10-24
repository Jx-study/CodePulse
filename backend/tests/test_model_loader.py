import threading
import pytest
from unittest.mock import MagicMock, patch
from services.algo_identification import model_loader


def _reset():
    model_loader._model = None
    model_loader._warmup_thread = None


def test_model_name_is_jina(monkeypatch):
    captured = {}
    fake_model = MagicMock()

    def fake_text_embedding(model_name):
        captured["model_name"] = model_name
        return fake_model

    _reset()
    monkeypatch.setattr("services.algo_identification.model_loader.TextEmbedding", fake_text_embedding)
    model_loader._load()
    assert captured["model_name"] == "jinaai/jina-embeddings-v2-base-code"


def test_get_model_loads_once(monkeypatch):
    _reset()
    call_count = 0
    fake_model = MagicMock()
    fake_model.embed.return_value = iter([])

    def fake_text_embedding(model_name):
        nonlocal call_count
        call_count += 1
        return fake_model

    monkeypatch.setattr("services.algo_identification.model_loader.TextEmbedding", fake_text_embedding)
    model_loader._load()
    m1 = model_loader._model
    model_loader._load()
    m2 = model_loader._model
    assert m1 is m2
    assert call_count == 1


def test_warmup_is_idempotent(monkeypatch):
    _reset()
    call_count = 0

    def fake_text_embedding(model_name):
        nonlocal call_count
        call_count += 1
        return MagicMock()

    monkeypatch.setattr("services.algo_identification.model_loader.TextEmbedding", fake_text_embedding)
    model_loader.warmup()
    model_loader.warmup()
    if model_loader._warmup_thread:
        model_loader._warmup_thread.join(timeout=10)
    assert call_count == 1


def test_get_model_concurrent_loads_once(monkeypatch):
    _reset()
    call_count = 0

    def fake_text_embedding(model_name):
        nonlocal call_count
        call_count += 1
        return MagicMock()

    monkeypatch.setattr("services.algo_identification.model_loader.TextEmbedding", fake_text_embedding)

    def load():
        model_loader._load()

    threads = [threading.Thread(target=load) for _ in range(5)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert call_count == 1
    assert model_loader._model is not None
