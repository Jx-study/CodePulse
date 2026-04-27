from dataclasses import dataclass

from . import embeddings_store, model_loader, similarity


@dataclass
class IdentifyResult:
    algo_name: str | None
    score: float
    top_raw: str


def identify(code: str) -> IdentifyResult:
    user_emb = model_loader.encode([code])[0]
    ref_matrix = embeddings_store.get_reference_matrix()
    labels = embeddings_store.get_labels()

    top_label, top_score = similarity.find_top_match(user_emb, ref_matrix, labels)
    final_label, final_score = similarity.apply_threshold(top_label, top_score)

    return IdentifyResult(
        algo_name=final_label,
        score=float(final_score),
        top_raw=top_label,
    )


def warmup() -> None:
    model_loader.warmup()
