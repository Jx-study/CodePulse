"""Practice business logic: question fetching, grading, Elo, XP."""
import random
from datetime import datetime, timezone

from database import db
from models.question import Question, QuestionTranslation, QuestionGroup, QuestionGroupTranslation
from models.practice import PracticeAttempt, AttemptAnswer
from models.tutorial import Tutorial, UserTutorialProgress
from models.xp import XpEvent, XpSourceType
from models.user import User

_ELO_K = 32.0
_PASS_THRESHOLD = 60


def derive_points(difficulty_rating: float) -> int:
    """由 difficulty_rating 派生題目權重，不存 DB。"""
    if difficulty_rating < 1200:
        return 1
    elif difficulty_rating < 1600:
        return 2
    return 3


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


CATEGORY_QUOTA = {
    1: {'basic': 6, 'application': 3, 'complexity': 1},
    2: {'basic': 5, 'application': 3, 'complexity': 2},
    3: {'basic': 3, 'application': 4, 'complexity': 3},
    4: {'basic': 2, 'application': 4, 'complexity': 4},
    5: {'basic': 1, 'application': 4, 'complexity': 5},
}


def _serialize_questions(questions: list, lang: str) -> list[dict]:
    """將 Question ORM objects 序列化為 dict list（含 i18n）。"""
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


def get_questions(tutorial_id: int, lang: str) -> list[dict]:
    """回傳 tutorial 所有 active 題目（供管理後台用）。"""
    questions = (
        Question.query
        .filter_by(tutorial_id=tutorial_id, is_active=True)
        .order_by(Question.display_order)
        .all()
    )
    return _serialize_questions(questions, lang)


def get_questions_for_user(tutorial_id: int, user, lang: str) -> list[dict]:
    """依 user skill_tier 選 10 題（各 category 配額），隨機回傳。"""
    tier = user.skill_tier or 1
    quota = CATEGORY_QUOTA[tier]

    all_q = Question.query.filter_by(tutorial_id=tutorial_id, is_active=True).all()

    buckets: dict[str, list] = {'basic': [], 'application': [], 'complexity': []}
    for q in all_q:
        buckets[q.category.value].append(q)

    selected = []
    selected_ids: set[int] = set()
    leftover = 0

    for cat, q_quota in quota.items():
        bucket = sorted(buckets[cat], key=lambda q: abs(user.skill_rating - q.difficulty_rating))
        picked = bucket[:q_quota]
        leftover += q_quota - len(picked)
        selected.extend(picked)
        selected_ids.update(q.question_id for q in picked)

    if leftover > 0:
        remaining = sorted(
            [q for q in all_q if q.question_id not in selected_ids],
            key=lambda q: abs(user.skill_rating - q.difficulty_rating),
        )
        selected.extend(remaining[:leftover])

    random.shuffle(selected)
    return _serialize_questions(selected, lang)


def _normalize(s: str) -> str:
    return str(s).replace(' ', '')


def _check_answer(user_answer, correct_answer: str) -> bool:
    """判斷 user_answer 是否正確。

    correct_answer 格式有兩種：
    - 純字串（single-choice / true-false / predict-line）：用 | 分隔多個可接受答案
    - JSON 陣列字串（multiple-choice / fill-code）：["ans1", "ans2"]，
      由 seed_questions._serialize_answer 序列化而來，每個位置獨立比對
    """
    import json

    # 嘗試解析 JSON 陣列（multiple-choice / fill-code）
    try:
        correct_list = json.loads(correct_answer)
    except (json.JSONDecodeError, TypeError):
        correct_list = None

    if isinstance(correct_list, list):
        # 前端 Array.toString() → "A,C"，或前端直接傳 JSON 字串
        if isinstance(user_answer, list):
            user_list = user_answer
        else:
            user_str = str(user_answer)
            try:
                parsed = json.loads(user_str)
                user_list = parsed if isinstance(parsed, list) else user_str.split(',')
            except (json.JSONDecodeError, ValueError):
                user_list = user_str.split(',')

        if len(user_list) != len(correct_list):
            return False

        # fill-code：按位置比對（順序有意義，每格可含 | 等價答案）
        # multiple-choice：選項沒有位置語意，改用排序後集合比對
        # 判斷方式：correct_list 每格是否含 | → 有的話是 fill-code
        is_fill_code = any('|' in str(c) for c in correct_list)
        if is_fill_code:
            for u, c in zip(user_list, correct_list):
                u_norm = _normalize(u)
                if not any(u_norm == _normalize(a) for a in str(c).split('|')):
                    return False
            return True
        else:
            # multiple-choice：排序後比對，忽略勾選順序
            user_sorted = sorted(_normalize(u) for u in user_list)
            correct_sorted = sorted(_normalize(str(c)) for c in correct_list)
            return user_sorted == correct_sorted

    # 一般字串：| 分隔多個可接受答案
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

        # snap_rating must be first line in loop body
        snap_rating = q.difficulty_rating
        points = derive_points(snap_rating)

        is_correct = _check_answer(a['user_answer'], q.correct_answer)
        if is_correct:
            correct_count += 1
            earned_points += points
        total_points += points

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
            'user_answer': str(a['user_answer']),
            'points': points,
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
    is_better_score = utp.best_score is None or score > utp.best_score
    is_same_score_faster = (
        utp.best_score is not None
        and score == utp.best_score
        and total_time
        and (utp.best_time_seconds is None or total_time < utp.best_time_seconds)
    )
    if is_better_score or is_same_score_faster:
        utp.best_score = score
        utp.best_attempt_id = attempt.attempt_id
        utp.best_correct_count = correct_count
        utp.total_questions = len(answer_records)
        if total_time:
            utp.best_time_seconds = total_time

    xp_earned = 0
    passed = score >= _PASS_THRESHOLD

    if passed and not utp.practice_passed:
        utp.practice_passed = True
        utp.practice_passed_at = now

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
