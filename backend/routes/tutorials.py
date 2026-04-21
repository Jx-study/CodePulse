from flask import Blueprint, jsonify, g, request
from datetime import datetime, timezone

from auth_utils import login_required
from database import db
from models.tutorial import Tutorial, UserTutorialProgress
from models.practice import LearningSession, SessionMode, PracticeAttempt
from models.xp import XpEvent, XpSourceType
from models.user import User
from services.practice_service import get_questions_for_user, submit_answers, get_question_translations

tutorials_bp = Blueprint('tutorials', __name__)


def _find_tutorial_by_slug(slug):
    return Tutorial.query.filter_by(slug=slug).first()


_VALID_LANGS = {'en', 'zh-TW'}


def _resolve_lang(user_id: int) -> str:
    """語言優先順序：?lang query string > user.language DB > 'en'"""
    qs_lang = request.args.get('lang', '').strip()
    if qs_lang in _VALID_LANGS:
        return qs_lang
    user = db.session.get(User, user_id)
    if user and user.language and user.language.value in _VALID_LANGS:
        return user.language.value
    return 'en'


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


@tutorials_bp.route('/<slug>/session/<int:session_id>', methods=['PATCH', 'POST'])
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
        val = data['duration_seconds']
        if not isinstance(val, int) or not (0 <= val <= 86400):
            return jsonify({'success': False, 'message': 'duration_seconds 必須為 0～86400 的整數'}), 400
        sess.duration_seconds = val

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    return jsonify({'success': True}), 200


_MIN_TEACHING_SECONDS = 30
_MAX_TEACHING_SECONDS = 3600  # 教學停留時間上限（1 小時）


@tutorials_bp.route('/<slug>/teaching-complete', methods=['PATCH', 'POST'])
@login_required
def teaching_complete(slug):
    t = _find_tutorial_by_slug(slug)
    if not t:
        return jsonify({'success': False, 'message': '教學不存在'}), 404

    user_id = g.current_user_id
    now = datetime.now(timezone.utc)

    # 時序驗證：必須有 teaching session 且停留 >= 30 秒
    latest_session = (
        LearningSession.query
        .filter_by(user_id=user_id, tutorial_id=t.tutorial_id, mode=SessionMode.teaching)
        .order_by(LearningSession.started_at.desc())
        .first()
    )
    if not latest_session:
        return jsonify({'success': False, 'message': '請先開始教學'}), 403
    started = latest_session.started_at
    if started.tzinfo is None:
        started = started.replace(tzinfo=timezone.utc)
    elapsed = (now - started).total_seconds()
    if elapsed < _MIN_TEACHING_SECONDS:
        return jsonify({'success': False, 'message': '閱讀時間不足'}), 403

    # 問題 8：server-side 補足 ended_at 與 duration_seconds（防前端未主動結束）
    if not latest_session.ended_at:
        latest_session.ended_at = now
        capped = min(int(elapsed), _MAX_TEACHING_SECONDS)
        latest_session.duration_seconds = capped

    utp = UserTutorialProgress.query.filter_by(
        user_id=user_id, tutorial_id=t.tutorial_id
    ).first()
    if not utp:
        utp = UserTutorialProgress(user_id=user_id, tutorial_id=t.tutorial_id)
        db.session.add(utp)
        db.session.flush()

    xp_earned = 0
    if not utp.teaching_completed:
        utp.teaching_completed = True
        utp.teaching_completed_at = now
        utp.last_accessed_at = now

        existing = XpEvent.query.filter_by(
            user_id=user_id,
            source_type=XpSourceType.teaching_complete,
            source_id=t.tutorial_id,
        ).first()
        if not existing:
            xp_earned = t.xp_teaching
            db.session.add(XpEvent(
                user_id=user_id,
                source_type=XpSourceType.teaching_complete,
                source_id=t.tutorial_id,
                xp_amount=xp_earned,
                description=f'Teaching complete: {slug}',
                created_at=now,
            ))
            user = db.session.get(User, user_id)
            user.total_xp = (user.total_xp or 0) + xp_earned

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    return jsonify({'success': True, 'xp_earned': xp_earned}), 200


@tutorials_bp.route('/<slug>/questions', methods=['GET'])
@login_required
def get_tutorial_questions(slug):
    t = _find_tutorial_by_slug(slug)
    if not t:
        return jsonify({'success': False, 'message': '教學不存在'}), 404
    lang = _resolve_lang(g.current_user_id)
    user = db.session.get(User, g.current_user_id)
    result = get_questions_for_user(t.tutorial_id, user, lang)
    return jsonify({'success': True, 'questions': result}), 200


@tutorials_bp.route('/<slug>/questions/translations', methods=['GET'])
@login_required
def get_question_translations_route(slug):
    t = _find_tutorial_by_slug(slug)
    if not t:
        return jsonify({'success': False, 'message': '教學不存在'}), 404

    lang = _resolve_lang(g.current_user_id)

    ids_param = request.args.get('ids', '').strip()
    if not ids_param:
        return jsonify({'success': False, 'message': '請提供 ids 參數'}), 400

    try:
        q_ids = [int(x) for x in ids_param.split(',') if x.strip()]
    except ValueError:
        return jsonify({'success': False, 'message': 'ids 格式錯誤，請用逗號分隔整數'}), 400

    if not q_ids:
        return jsonify({'success': False, 'message': '請提供至少一個 id'}), 400
    if len(q_ids) > 50:
        return jsonify({'success': False, 'message': '一次最多查詢 50 題'}), 400

    from models.question import Question
    valid_ids = {
        q.question_id
        for q in Question.query.filter(
            Question.question_id.in_(q_ids),
            Question.tutorial_id == t.tutorial_id,
        ).with_entities(Question.question_id).all()
    }
    q_ids = [qid for qid in q_ids if qid in valid_ids]

    group_id_rows = Question.query.filter(
        Question.question_id.in_(q_ids),
        Question.group_id.isnot(None),
    ).with_entities(Question.group_id).distinct().all()
    group_ids = [row.group_id for row in group_id_rows]

    has_submitted = PracticeAttempt.query.filter_by(
        user_id=g.current_user_id,
        tutorial_id=t.tutorial_id,
    ).first() is not None

    result = get_question_translations(q_ids, group_ids, lang, include_explanation=has_submitted)
    return jsonify({'success': True, **result}), 200


_MAX_SUBMIT_QUESTIONS = 50
_MAX_TIME_PER_QUESTION = 600  # 秒


@tutorials_bp.route('/<slug>/submit', methods=['POST'])
@login_required
def submit_practice(slug):
    t = _find_tutorial_by_slug(slug)
    if not t:
        return jsonify({'success': False, 'message': '教學不存在'}), 404

    answers_input = request.get_json(silent=True)
    if not answers_input or not isinstance(answers_input, list):
        return jsonify({'success': False, 'message': '請提供答案列表'}), 400
    if len(answers_input) > _MAX_SUBMIT_QUESTIONS:
        return jsonify({'success': False, 'message': f'一次最多提交 {_MAX_SUBMIT_QUESTIONS} 題'}), 400
    for i, a in enumerate(answers_input):
        if not isinstance(a, dict):
            return jsonify({'success': False, 'message': f'第 {i+1} 筆答案格式錯誤'}), 400
        if 'question_id' not in a or not isinstance(a['question_id'], int):
            return jsonify({'success': False, 'message': f'第 {i+1} 筆答案缺少有效的 question_id'}), 400
        if 'user_answer' not in a:
            return jsonify({'success': False, 'message': f'第 {i+1} 筆答案缺少 user_answer'}), 400
        time_s = a.get('time_spent_seconds')
        if time_s is not None:
            if not isinstance(time_s, (int, float)) or not (0 <= time_s <= _MAX_TIME_PER_QUESTION):
                return jsonify({'success': False, 'message': f'第 {i+1} 筆答案的 time_spent_seconds 無效'}), 400

    lang = _resolve_lang(g.current_user_id)
    try:
        result = submit_answers(t, g.current_user_id, answers_input, lang)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    return jsonify({'success': True, **result}), 200
