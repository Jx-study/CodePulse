from flask import Blueprint, jsonify, g
from auth_utils import login_required
from database import db
from models.explorer import ExploreHistory

explore_bp = Blueprint('explore', __name__, url_prefix='/api/explore')

MAX_HISTORY = 5


@explore_bp.route('/history', methods=['GET'])
@login_required
def list_history():
    records = (
        ExploreHistory.query
        .filter_by(user_id=g.current_user_id)
        .order_by(ExploreHistory.created_at.desc())
        .limit(MAX_HISTORY)
        .all()
    )
    return jsonify([_serialize(r) for r in records]), 200


@explore_bp.route('/history/<int:record_id>', methods=['DELETE'])
@login_required
def delete_history(record_id):
    record = ExploreHistory.query.filter_by(
        explore_id=record_id,
        user_id=g.current_user_id,
    ).first()
    if record is None:
        return jsonify({'error': 'not found'}), 404
    db.session.delete(record)
    db.session.commit()
    return jsonify({'ok': True}), 200


def _serialize(r: ExploreHistory) -> dict:
    return {
        'id': r.explore_id,
        'detected_algorithm': r.detected_algorithm,
        'time_complexity': r.time_complexity,
        'analysis_source': r.analysis_source.value if r.analysis_source else None,
        'code_preview': (r.user_code[:120] + '…') if len(r.user_code) > 120 else r.user_code,
        'user_code': r.user_code,
        'created_at': r.created_at.isoformat(),
    }
