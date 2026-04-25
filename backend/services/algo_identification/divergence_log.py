import hashlib
import logging

from database import db
from models.explorer import AlgoDivergenceLog
from services.algo_identification import IdentifyResult

logger = logging.getLogger(__name__)


def log_divergence(
    code: str,
    identify_result: IdentifyResult,
    is_recursive: bool,
    expected_struct: str,
    divergence_type: str,
) -> None:
    try:
        code_hash = hashlib.sha256(code.encode()).hexdigest()
        # Known: concurrent requests with identical code_hash can both read None
        # and produce a UNIQUE violation swallowed below. Acceptable for MVP low-traffic logging.
        existing = AlgoDivergenceLog.query.filter_by(code_hash=code_hash).first()
        if existing:
            existing.occurrence_count += 1
        else:
            db.session.add(AlgoDivergenceLog(
                code_hash=code_hash,
                code=code,
                detected_algo=identify_result.top_raw,
                confidence=identify_result.score,
                is_recursive=is_recursive,
                expected_struct=expected_struct,
                divergence_type=divergence_type,
            ))
        db.session.commit()
    except Exception:
        logger.warning("log_divergence: DB write failed", exc_info=True)
        try:
            db.session.rollback()
        except Exception:
            logger.warning("log_divergence: rollback also failed", exc_info=True)
