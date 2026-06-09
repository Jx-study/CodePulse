import hashlib

from database import db
from models.explorer import ExploreHistory
from services.code_normalizer import normalize_code

MAX_HISTORY = 5


def list_user_history(user_id: int) -> list[ExploreHistory]:
    return (
        ExploreHistory.query
        .filter_by(user_id=user_id)
        .order_by(ExploreHistory.created_at.desc())
        .limit(MAX_HISTORY)
        .all()
    )


def count_user_history(user_id: int) -> int:
    return ExploreHistory.query.filter_by(user_id=user_id).count()


def has_history_capacity(user_id: int) -> bool:
    return count_user_history(user_id) < MAX_HISTORY


def find_matching_history(code: str, user_id: int) -> ExploreHistory | None:
    normalized = normalize_code(code)
    if not normalized:
        return None

    current_hash = hashlib.sha256(normalized.encode()).hexdigest()
    history_records = (
        ExploreHistory.query
        .with_entities(ExploreHistory.explore_id, ExploreHistory.user_code)
        .filter_by(user_id=user_id)
        .all()
    )
    matching_id = None
    for explore_id, user_code in history_records:
        history_normalized = normalize_code(user_code)
        if not history_normalized:
            continue
        history_hash = hashlib.sha256(history_normalized.encode()).hexdigest()
        if history_hash == current_hash:
            matching_id = explore_id
            break

    if matching_id is not None:
        return ExploreHistory.query.filter_by(
            explore_id=matching_id,
            user_id=user_id,
        ).first()

    return None


def delete_user_history(record_id: int, user_id: int) -> bool:
    record = ExploreHistory.query.filter_by(
        explore_id=record_id,
        user_id=user_id,
    ).first()
    if record is None:
        return False
    db.session.delete(record)
    db.session.commit()
    return True


def serialize_history(record: ExploreHistory) -> dict:
    normalized = normalize_code(record.user_code)
    code_hash = hashlib.sha256(normalized.encode()).hexdigest() if normalized else None
    return {
        'id': record.explore_id,
        'code_hash': code_hash,
        'detected_algorithm': record.detected_algorithm,
        'confidence_score': record.confidence_score,
        'time_complexity': record.time_complexity,
        'analysis_source': record.analysis_source.value if record.analysis_source else None,
        'code_preview': (record.user_code[:120] + '...') if len(record.user_code) > 120 else record.user_code,
        'user_code': record.user_code,
        'created_at': record.created_at.isoformat(),
        'have_level1': record.have_level1,
        'is_truncated': record.is_truncated,
        'execution_trace': record.execution_trace or [],
        'raw_trace': record.raw_trace or [],
        'raw_index_map': record.raw_index_map or [],
        'call_graph': record.call_graph,
        'cfg_graph': record.cfg_graph or {},
        'stdout_events': record.stdout_events or [],
        'top3_candidates': record.top3_candidates or [],
        'ai_summary': record.ai_summary,
        'ai_feedback': record.ai_feedback,
    }
