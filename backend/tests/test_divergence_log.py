import hashlib
import pytest

from services.algo_identification import IdentifyResult
from services.algo_identification.divergence_log import log_divergence


CODE = "def bubble_sort(arr):\n    pass"
CODE_HASH = hashlib.sha256(CODE.encode()).hexdigest()


def _make_result(top_raw="bubble_sort", score=0.72):
    return IdentifyResult(algo_name=None, score=score, top_raw=top_raw)


@pytest.fixture()
def db_session(app):
    """Use the existing conftest app fixture to get a clean DB session."""
    from database import db
    from models.explorer import AlgoDivergenceLog
    yield db
    db.session.query(AlgoDivergenceLog).delete()
    db.session.commit()


def test_first_write_creates_record(db_session):
    from models.explorer import AlgoDivergenceLog

    log_divergence(
        code=CODE,
        identify_result=_make_result(),
        is_recursive=False,
        expected_struct="iterative",
        divergence_type="structure_mismatch",
    )

    row = db_session.session.query(AlgoDivergenceLog).filter_by(code_hash=CODE_HASH).first()
    assert row is not None
    assert row.occurrence_count == 1
    assert row.detected_algo == "bubble_sort"
    assert row.divergence_type == "structure_mismatch"
    assert row.first_seen_at is not None


def test_repeat_write_increments_count(db_session):
    from models.explorer import AlgoDivergenceLog

    log_divergence(
        code=CODE,
        identify_result=_make_result(),
        is_recursive=False,
        expected_struct="iterative",
        divergence_type="structure_mismatch",
    )
    log_divergence(
        code=CODE,
        identify_result=_make_result(),
        is_recursive=False,
        expected_struct="iterative",
        divergence_type="structure_mismatch",
    )

    row = db_session.session.query(AlgoDivergenceLog).filter_by(code_hash=CODE_HASH).first()
    assert row.occurrence_count == 2
    assert row.last_seen_at >= row.first_seen_at


def test_db_failure_does_not_raise(monkeypatch):
    """DB errors must be swallowed - never propagate to caller.
    Patch rollback as well so rollback failures are also swallowed.
    """
    from database import db

    def explode(*a, **kw):
        raise RuntimeError("DB is down")

    monkeypatch.setattr(db.session, "commit", explode)
    monkeypatch.setattr(db.session, "rollback", explode)

    log_divergence(
        code=CODE,
        identify_result=_make_result(),
        is_recursive=False,
        expected_struct="iterative",
        divergence_type="low_confidence",
    )
