from dataclasses import dataclass, field

from . import embeddings_store, model_loader, similarity
from .normalizer import normalize_identifiers


@dataclass
class IdentifyResult:
    algo_name: str | None
    score: float
    top_raw: str
    top3: list[tuple[str, float]] = field(default_factory=list)


def identify(code: str) -> IdentifyResult:
    user_emb = model_loader.encode([normalize_identifiers(code)])[0]
    ref_matrix = embeddings_store.get_reference_matrix()
    labels = embeddings_store.get_labels()

    top3 = similarity.find_top_n(user_emb, ref_matrix, labels, n=3)
    top_label, top_score = top3[0] if top3 else ("", 0.0)
    final_label, final_score = similarity.apply_threshold(top_label, top_score)

    return IdentifyResult(
        algo_name=final_label,
        score=float(top_score),
        top_raw=top_label,
        top3=top3,
    )


def warmup() -> None:
    model_loader.warmup()
