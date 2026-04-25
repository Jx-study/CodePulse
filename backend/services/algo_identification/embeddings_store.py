import json
from pathlib import Path

import numpy as np

_EMBEDDINGS_DIR = Path(__file__).parent / "embeddings"
_matrix: np.ndarray | None = None
_labels: list[str] | None = None


def load() -> None:
    global _matrix, _labels
    if _matrix is not None:
        return
    npy_path = _EMBEDDINGS_DIR / "reference_embeddings.npy"
    json_path = _EMBEDDINGS_DIR / "labels.json"
    matrix = np.load(npy_path).astype(np.float32)
    with open(json_path) as f:
        labels = json.load(f)
    if matrix.shape[0] != len(labels):
        raise ValueError(
            f"shape mismatch: matrix has {matrix.shape[0]} rows but labels has {len(labels)} entries"
        )
    _matrix = matrix
    _labels = labels


def get_reference_matrix() -> np.ndarray:
    if _matrix is None:
        load()
    return _matrix  # type: ignore[return-value]


def get_labels() -> list[str]:
    if _labels is None:
        load()
    return _labels  # type: ignore[return-value]
