from flask import Blueprint, jsonify, g, request
from datetime import datetime, timezone

from auth_utils import login_required
from database import db
from models.tutorial import Tutorial, UserTutorialProgress, TutorialStatus
from models.practice import LearningSession, PracticeAttempt, AttemptAnswer, SessionMode
from models.question import Question, QuestionTranslation, QuestionGroup, QuestionGroupTranslation
from models.xp import XpEvent, XpSourceType
from models.user import User

tutorials_bp = Blueprint('tutorials', __name__)


def _find_tutorial_by_slug(slug):
    return Tutorial.query.filter_by(slug=slug).first()


@tutorials_bp.route('/<slug>/session', methods=['POST'])
@login_required
def create_session(slug):
    t = _find_tutorial_by_slug(slug)
    if not t:
        return jsonify({'success': False, 'message': '教學不存在'}), 404

    data = request.get_json(silent=True) or {}
    mode_str = data.get('mode', 'teaching')
    try:
        mode = SessionMode[mode_str]
    except KeyError:
        return jsonify({'success': False, 'message': 'mode 必須為 teaching 或 practice'}), 400

    sess = LearningSession(
        user_id=g.current_user_id,
        tutorial_id=t.tutorial_id,
        mode=mode,
        started_at=datetime.now(timezone.utc),
    )
    db.session.add(sess)

    utp = UserTutorialProgress.query.filter_by(
        user_id=g.current_user_id, tutorial_id=t.tutorial_id
    ).first()
    now = datetime.now(timezone.utc)
    if utp:
        utp.last_accessed_at = now
    else:
        utp = UserTutorialProgress(
            user_id=g.current_user_id,
            tutorial_id=t.tutorial_id,
            last_accessed_at=now,
        )
        db.session.add(utp)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    return jsonify({'success': True, 'session_id': sess.session_id}), 201


@tutorials_bp.route('/<slug>/session/<int:session_id>', methods=['PATCH'])
@login_required
def update_session(slug, session_id):
    t = _find_tutorial_by_slug(slug)
    if not t:
        return jsonify({'success': False, 'message': '教學不存在'}), 404

    sess = LearningSession.query.filter_by(
        session_id=session_id, user_id=g.current_user_id, tutorial_id=t.tutorial_id
    ).first()
    if not sess:
        return jsonify({'success': False, 'message': 'Session 不存在'}), 404

    data = request.get_json(silent=True) or {}
    sess.ended_at = datetime.now(timezone.utc)
    if 'duration_seconds' in data:
        sess.duration_seconds = data['duration_seconds']

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    return jsonify({'success': True}), 200


@tutorials_bp.route('/<slug>/questions', methods=['GET'])
@login_required
def get_tutorial_questions(slug):
    # Stub – full implementation in a later task
    return jsonify({'success': True, 'questions': []}), 200
