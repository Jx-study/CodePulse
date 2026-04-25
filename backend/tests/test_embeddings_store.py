import numpy as np
import pytest
from services.algo_identification import embeddings_store


def test_load_returns_correct_shapes():
    embeddings_store._matrix = None
    embeddings_store._labels = None
    embeddings_store.load()
    matrix = embeddings_store.get_reference_matrix()
    labels = embeddings_store.get_labels()
    assert matrix.ndim == 2
    assert matrix.shape[1] == 384
    assert matrix.dtype == np.float32
    assert matrix.shape[0] == len(labels)
    assert len(labels) > 0


def test_load_is_idempotent():
    embeddings_store.load()
    matrix1 = embeddings_store.get_reference_matrix()
    embeddings_store.load()
    matrix2 = embeddings_store.get_reference_matrix()
    assert matrix1 is matrix2  # same object — not reloaded


def test_mismatched_shapes_raise(tmp_path, monkeypatch):
    import json
    import numpy as np_local

    bad_npy = tmp_path / "reference_embeddings.npy"
    bad_labels = tmp_path / "labels.json"
    np_local.save(bad_npy, np_local.zeros((3, 384), dtype=np_local.float32))
    with open(bad_labels, "w") as f:
        json.dump(["a", "b"], f)  # only 2 labels for 3 rows

    monkeypatch.setattr("services.algo_identification.embeddings_store._EMBEDDINGS_DIR", tmp_path)
    embeddings_store._matrix = None
    embeddings_store._labels = None
    with pytest.raises(ValueError, match="shape mismatch"):
        embeddings_store.load()
