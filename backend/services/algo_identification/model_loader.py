import logging
import threading

import numpy as np
from fastembed import TextEmbedding

_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_model: TextEmbedding | None = None
_lock = threading.Lock()
_warmup_thread: threading.Thread | None = None

logger = logging.getLogger(__name__)


def _load() -> None:
    global _model
    with _lock:
        if _model is None:
            logger.info("Loading MiniLM model...")
            _model = TextEmbedding(model_name=_MODEL_NAME)
            logger.info("MiniLM model loaded.")


def warmup() -> None:
    """Start background thread to load model. Idempotent."""
    global _warmup_thread
    if _model is not None or (_warmup_thread is not None and _warmup_thread.is_alive()):
        return
    _warmup_thread = threading.Thread(target=_load, daemon=True, name="minilm-warmup")
    _warmup_thread.start()


def encode(texts: list[str]) -> np.ndarray:
    """Encode texts and return float32 numpy array, shape (N, D)."""
    if _model is None:
        _load()
    return np.array(list(_model.embed(texts)), dtype=np.float32)  # type: ignore[union-attr]
