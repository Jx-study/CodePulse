import numpy as np

THRESHOLD: float = 0.45


def find_top_match(
    user_embedding: np.ndarray,
    reference_matrix: np.ndarray,
    labels: list[str],
) -> tuple[str, float]:
    """Return (top_label, top_score). When a label has multiple rows, take the max score."""
    user_norm = user_embedding / (np.linalg.norm(user_embedding) + 1e-10)
    ref_norms = reference_matrix / (
        np.linalg.norm(reference_matrix, axis=1, keepdims=True) + 1e-10
    )
    scores = ref_norms @ user_norm  # shape (N,)

    label_scores: dict[str, float] = {}
    for label, score in zip(labels, scores):
        label_scores[label] = max(label_scores.get(label, -1.0), float(score))

    top_label = max(label_scores, key=lambda k: label_scores[k])
    return top_label, label_scores[top_label]


def apply_threshold(
    top_label: str,
    top_score: float,
) -> tuple[str | None, float]:
    if top_score < THRESHOLD:
        return None, top_score
    return top_label, top_score
