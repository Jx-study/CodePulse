from flask import Blueprint, jsonify, g

from auth_utils import login_required
from services.playground_history import (
    delete_user_history,
    list_user_history,
    serialize_history,
)

explore_bp = Blueprint('explore', __name__, url_prefix='/api/explore')


@explore_bp.route('/history', methods=['GET'])
@login_required
def list_history():
    records = list_user_history(g.current_user_id)
    return jsonify([serialize_history(r) for r in records]), 200


@explore_bp.route('/history/<int:record_id>', methods=['DELETE'])
@login_required
def delete_history(record_id):
    if not delete_user_history(record_id, g.current_user_id):
        return jsonify({'error': 'not found'}), 404
    return jsonify({'ok': True}), 200
