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

_ELO_K = 32.0


def _elo_expected(user_rating: float, question_rating: float) -> float:
    return 1.0 / (1.0 + 10.0 ** ((question_rating - user_rating) / 400.0))


def _apply_elo(user_rating: float, question_rating: float, correct: bool):
    actual = 1.0 if correct else 0.0
    expected = _elo_expected(user_rating, question_rating)
    new_user = user_rating + _ELO_K * (actual - expected)
    new_question = question_rating + _ELO_K * (expected - actual)
    return new_user, new_question


def _calc_tier(rating: float) -> int:
    if rating < 1150:
        return 1
    if rating < 1350:
        return 2
    if rating < 1550:
        return 3
    if rating < 1750:
        return 4
    return 5


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


@tutorials_bp.route('/<slug>/teaching-complete', methods=['PATCH'])
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
        if utp.status in (TutorialStatus.teaching_in_progress, None):
            utp.status = TutorialStatus.teaching_done

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

    lang = request.args.get('lang', 'en')
    if lang not in {'en', 'zh-TW'}:
        lang = 'en'

    questions = (
        Question.query
        .filter_by(tutorial_id=t.tutorial_id, is_active=True)
        .order_by(Question.display_order)
        .all()
    )

    q_ids = [q.question_id for q in questions]
    translations = {}
    if q_ids:
        for qt in QuestionTranslation.query.filter(
            QuestionTranslation.question_id.in_(q_ids),
            QuestionTranslation.language_code == lang,
        ).all():
            translations[qt.question_id] = qt

    group_ids = list({q.group_id for q in questions if q.group_id})
    groups = {}
    group_translations = {}
    if group_ids:
        for grp in QuestionGroup.query.filter(
            QuestionGroup.group_id.in_(group_ids)
        ).all():
            groups[grp.group_id] = grp
        for gt in QuestionGroupTranslation.query.filter(
            QuestionGroupTranslation.group_id.in_(group_ids),
            QuestionGroupTranslation.language_code == lang,
        ).all():
            group_translations[gt.group_id] = gt

    result = []
    for q in questions:
        qt = translations.get(q.question_id)
        item = {
            'question_id': q.question_id,
            'question_type': q.question_type.value,
            'category': q.category.value,
            'code': q.code,
            'language': q.language,
            'points': q.points,
            'group_id': q.group_id,
            'stem': qt.stem if qt else '',
            'options': qt.options if qt else [],
        }
        if q.group_id and q.group_id in groups:
            grp = groups[q.group_id]
            gt = group_translations.get(q.group_id)
            item['group'] = {
                'title': gt.title if gt else '',
                'description': gt.description if gt else None,
                'code': grp.code,
                'language': grp.language,
            }
        else:
            item['group'] = None
        result.append(item)

    return jsonify({'success': True, 'questions': result}), 200


_PASS_THRESHOLD = 60
_MAX_SUBMIT_QUESTIONS = 50
_MAX_TIME_PER_QUESTION = 3600  # 秒


@tutorials_bp.route('/<slug>/submit', methods=['POST'])
@login_required
def submit_practice(slug):
    t = _find_tutorial_by_slug(slug)
    if not t:
        return jsonify({'success': False, 'message': '教學不存在'}), 404

    user_id = g.current_user_id
    answers_input = request.get_json(silent=True)
    if not answers_input or not isinstance(answers_input, list):
        return jsonify({'success': False, 'message': '請提供答案列表'}), 400

    # 問題一：限制提交數量，防止 DoS
    if len(answers_input) > _MAX_SUBMIT_QUESTIONS:
        return jsonify({'success': False, 'message': f'一次最多提交 {_MAX_SUBMIT_QUESTIONS} 題'}), 400

    # 問題一：驗證每筆答案的結構與型別
    for i, a in enumerate(answers_input):
        if not isinstance(a, dict):
            return jsonify({'success': False, 'message': f'第 {i+1} 筆答案格式錯誤'}), 400
        if 'question_id' not in a or not isinstance(a['question_id'], int):
            return jsonify({'success': False, 'message': f'第 {i+1} 筆答案缺少有效的 question_id'}), 400
        if 'user_answer' not in a:
            return jsonify({'success': False, 'message': f'第 {i+1} 筆答案缺少 user_answer'}), 400
        # 問題二：驗證 time_spent_seconds 範圍
        time_s = a.get('time_spent_seconds')
        if time_s is not None:
            if not isinstance(time_s, (int, float)) or not (0 <= time_s <= _MAX_TIME_PER_QUESTION):
                return jsonify({'success': False, 'message': f'第 {i+1} 筆答案的 time_spent_seconds 無效'}), 400

    user = db.session.get(User, user_id)
    q_ids = [a['question_id'] for a in answers_input]
    questions = {
        q.question_id: q
        for q in Question.query.filter(
            Question.question_id.in_(q_ids),
            Question.tutorial_id == t.tutorial_id,
        ).all()
    }
    translations = {
        qt.question_id: qt
        for qt in QuestionTranslation.query.filter(
            QuestionTranslation.question_id.in_(q_ids),
        ).all()
    }

    now = datetime.now(timezone.utc)
    user_rating = user.skill_rating
    correct_count = 0
    total_points = 0
    earned_points = 0
    answer_records = []
    answer_results = []
    total_time = 0

    for a in answers_input:
        q = questions.get(a['question_id'])
        if not q:
            continue
        is_correct = (str(a['user_answer']).strip() == str(q.correct_answer).strip())
        if is_correct:
            correct_count += 1
            earned_points += q.points
        total_points += q.points

        snap_rating = q.difficulty_rating
        new_user_rating, new_q_rating = _apply_elo(user_rating, snap_rating, is_correct)
        user_rating = new_user_rating
        q.difficulty_rating = new_q_rating
        q.times_answered += 1
        if is_correct:
            q.times_correct += 1

        time_s = a.get('time_spent_seconds')
        if isinstance(time_s, (int, float)) and time_s > 0:
            total_time += time_s

        answer_records.append({
            'question_id': q.question_id,
            'user_answer': a['user_answer'],
            'is_correct': is_correct,
            'time_spent_seconds': time_s,
            'snap_rating': snap_rating,
        })
        qt = translations.get(q.question_id)
        answer_results.append({
            'question_id': q.question_id,
            'is_correct': is_correct,
            'explanation': qt.explanation if qt else None,
        })

    score = int((earned_points / total_points) * 100) if total_points > 0 else 0
    rating_delta = round(user_rating - user.skill_rating, 2)

    attempt = PracticeAttempt(
        user_id=user_id,
        tutorial_id=t.tutorial_id,
        score=score,
        correct_count=correct_count,
        total_questions=len(answer_records),
        time_spent_seconds=total_time or None,
        user_rating_before=user.skill_rating,
        user_rating_after=user_rating,
        rating_delta=rating_delta,
        submitted_at=now,
    )
    db.session.add(attempt)
    db.session.flush()

    for ar in answer_records:
        db.session.add(AttemptAnswer(
            attempt_id=attempt.attempt_id,
            question_id=ar['question_id'],
            user_answer=str(ar['user_answer']),
            is_correct=ar['is_correct'],
            time_spent_seconds=ar['time_spent_seconds'],
            question_difficulty_rating=ar['snap_rating'],
            answered_at=now,
        ))

    user.skill_rating = user_rating
    user.skill_tier = _calc_tier(user_rating)

    utp = UserTutorialProgress.query.filter_by(
        user_id=user_id, tutorial_id=t.tutorial_id
    ).first()
    if not utp:
        utp = UserTutorialProgress(user_id=user_id, tutorial_id=t.tutorial_id)
        db.session.add(utp)
        db.session.flush()

    utp.attempt_count = (utp.attempt_count or 0) + 1
    utp.last_accessed_at = now
    if utp.best_score is None or score > utp.best_score:
        utp.best_score = score
        utp.best_attempt_id = attempt.attempt_id
        utp.best_correct_count = correct_count
        utp.total_questions = len(answer_records)
    if total_time and (utp.best_time_seconds is None or total_time < utp.best_time_seconds):
        utp.best_time_seconds = total_time

    xp_earned = 0
    passed = score >= _PASS_THRESHOLD

    if passed and not utp.practice_passed:
        utp.practice_passed = True
        utp.practice_passed_at = now
        utp.status = TutorialStatus.completed

        existing_pass = XpEvent.query.filter_by(
            user_id=user_id,
            source_type=XpSourceType.practice_pass,
            source_id=t.tutorial_id,
        ).first()
        if not existing_pass:
            xp_pass = t.xp_practice_base
            xp_earned += xp_pass
            db.session.add(XpEvent(
                user_id=user_id,
                source_type=XpSourceType.practice_pass,
                source_id=t.tutorial_id,
                xp_amount=xp_pass,
                description=f'Practice passed: {slug}',
                created_at=now,
            ))

    if score == 100:
        existing_perfect = XpEvent.query.filter_by(
            user_id=user_id,
            source_type=XpSourceType.practice_perfect,
            source_id=t.tutorial_id,
        ).first()
        if not existing_perfect:
            xp_perfect = t.xp_perfect_bonus
            xp_earned += xp_perfect
            db.session.add(XpEvent(
                user_id=user_id,
                source_type=XpSourceType.practice_perfect,
                source_id=t.tutorial_id,
                xp_amount=xp_perfect,
                description=f'Perfect score: {slug}',
                created_at=now,
            ))

    if xp_earned:
        user.total_xp = (user.total_xp or 0) + xp_earned

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'message': '伺服器錯誤'}), 500

    return jsonify({
        'success': True,
        'score': score,
        'correct_count': correct_count,
        'xp_earned': xp_earned,
        'rating_delta': rating_delta,
        'new_rating': round(user_rating, 2),
        'results': answer_results,
    }), 200
