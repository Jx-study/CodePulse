"""Practice business logic: question fetching, grading, Elo, XP."""
from datetime import datetime, timezone

from database import db
from models.question import Question, QuestionTranslation, QuestionGroup, QuestionGroupTranslation
from models.practice import PracticeAttempt, AttemptAnswer
from models.tutorial import Tutorial, UserTutorialProgress, TutorialStatus
from models.xp import XpEvent, XpSourceType
from models.user import User

_ELO_K = 32.0
_PASS_THRESHOLD = 60


def _elo_expected(user_rating: float, question_rating: float) -> float:
    return 1.0 / (1.0 + 10.0 ** ((question_rating - user_rating) / 400.0))


def _apply_elo(user_rating: float, question_rating: float, correct: bool):
    actual = 1.0 if correct else 0.0
    expected = _elo_expected(user_rating, question_rating)
    new_user = user_rating + _ELO_K * (actual - expected)
    new_question = question_rating + _ELO_K * (expected - actual)
    return new_user, new_question


def calc_tier(rating: float) -> int:
    if rating < 1150:
        return 1
    if rating < 1350:
        return 2
    if rating < 1550:
        return 3
    if rating < 1750:
        return 4
    return 5


def get_questions(tutorial_id: int, lang: str) -> list[dict]:
    """回傳 tutorial 所有 active 題目（含 i18n），不含 correct_answer / explanation。"""
    questions = (
        Question.query
        .filter_by(tutorial_id=tutorial_id, is_active=True)
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
        for grp in QuestionGroup.query.filter(QuestionGroup.group_id.in_(group_ids)).all():
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
    return result


def _normalize(s: str) -> str:
    return str(s).replace(' ', '')


def _check_answer(user_answer, correct_answer: str) -> bool:
    user_norm = _normalize(user_answer)
    return any(user_norm == _normalize(a) for a in correct_answer.split('|'))


def submit_answers(
    tutorial: Tutorial,
    user_id: int,
    answers_input: list[dict],
    lang: str,
) -> dict:
    """判題、更新 Elo、發放 XP，回傳結果 dict。不做 HTTP 驗證。"""
    user = db.session.get(User, user_id)
    q_ids = [a['question_id'] for a in answers_input]
    questions = {
        q.question_id: q
        for q in Question.query.filter(
            Question.question_id.in_(q_ids),
            Question.tutorial_id == tutorial.tutorial_id,
        ).all()
    }
    translations = {
        qt.question_id: qt
        for qt in QuestionTranslation.query.filter(
            QuestionTranslation.question_id.in_(q_ids),
            QuestionTranslation.language_code == lang,
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
        is_correct = _check_answer(a['user_answer'], q.correct_answer)
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
            'correct_answer': q.correct_answer,
            'explanation': qt.explanation if qt else None,
        })

    score = int((earned_points / total_points) * 100) if total_points > 0 else 0
    rating_delta = round(user_rating - user.skill_rating, 2)

    attempt = PracticeAttempt(
        user_id=user_id,
        tutorial_id=tutorial.tutorial_id,
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
    user.skill_tier = calc_tier(user_rating)

    utp = UserTutorialProgress.query.filter_by(
        user_id=user_id, tutorial_id=tutorial.tutorial_id
    ).first()
    if not utp:
        utp = UserTutorialProgress(user_id=user_id, tutorial_id=tutorial.tutorial_id)
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
            source_id=tutorial.tutorial_id,
        ).first()
        if not existing_pass:
            xp_pass = tutorial.xp_practice_base
            xp_earned += xp_pass
            db.session.add(XpEvent(
                user_id=user_id,
                source_type=XpSourceType.practice_pass,
                source_id=tutorial.tutorial_id,
                xp_amount=xp_pass,
                description=f'Practice passed: {tutorial.slug}',
                created_at=now,
            ))

    if score == 100:
        existing_perfect = XpEvent.query.filter_by(
            user_id=user_id,
            source_type=XpSourceType.practice_perfect,
            source_id=tutorial.tutorial_id,
        ).first()
        if not existing_perfect:
            xp_perfect = tutorial.xp_perfect_bonus
            xp_earned += xp_perfect
            db.session.add(XpEvent(
                user_id=user_id,
                source_type=XpSourceType.practice_perfect,
                source_id=tutorial.tutorial_id,
                xp_amount=xp_perfect,
                description=f'Perfect score: {tutorial.slug}',
                created_at=now,
            ))

    if xp_earned:
        user.total_xp = (user.total_xp or 0) + xp_earned

    return {
        'score': score,
        'correct_count': correct_count,
        'xp_earned': xp_earned,
        'rating_delta': rating_delta,
        'new_rating': round(user_rating, 2),
        'results': answer_results,
    }
