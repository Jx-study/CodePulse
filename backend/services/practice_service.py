import json
import math
import random
from datetime import datetime, timezone

from sqlalchemy import func

from database import db
from models.question import Question, QuestionTranslation, QuestionGroup, QuestionGroupTranslation
from models.practice import PracticeAttempt, AttemptAnswer
from models.tutorial import Tutorial, UserTutorialProgress
from models.xp import XpEvent, XpSourceType
from models.user import User

_USER_ELO_K_BASE = 32.0     # 第 1 次答題全額
_USER_ELO_K_DECAY = {
    1: _USER_ELO_K_BASE,
    2: _USER_ELO_K_BASE/2 # 第 2 次半衰，第 3 次以上用 4.0
}  
_USER_ELO_K_MIN = 4.0       # 第 3 次以上幾乎凍結
_QUESTION_ELO_K = 8.0       # 題目端：首殺絕對制，只更新第 1 次
_PASS_THRESHOLD = 60
_GROUP_TOLERANCE = 1        # 題組各 category 題數允許超出配額的寬容值
_MAX_QUESTIONS = 10         # 每次練習題數硬上限
_GROUP_INCLUDE_PROB = 0.5   # 抽到符合資格題組時，實際帶入的機率


def derive_points(difficulty_rating: float) -> int:
    """由 difficulty_rating 派生題目權重，不存 DB"""
    if difficulty_rating < 1200:
        return 1
    elif difficulty_rating < 1600:
        return 2
    return 3


def _elo_expected(user_rating: float, question_rating: float) -> float:
    return 1.0 / (1.0 + 10.0 ** ((question_rating - user_rating) / 400.0))


def _elo_weight(user_rating: float, question_rating: float) -> float:
    """指數衰減權重：差距越小權重越高，差 200 分時權重降至 0.37。"""
    return math.exp(-abs(user_rating - question_rating) / 200.0)


def _weighted_sample(pool: list, k: int, user_rating: float) -> list:
    """依 Elo 距離權重從 pool 中不重複抽取 k 題。"""
    if len(pool) <= k:
        return pool[:]
    result = []
    remaining = list(pool)
    for _ in range(k):
        weights = [_elo_weight(user_rating, q.difficulty_rating) for q in remaining]
        chosen = random.choices(remaining, weights=weights, k=1)[0]
        result.append(chosen)
        remaining.remove(chosen)
    return result


def _get_user_k(answer_count: int) -> float:
    """依該題的歷史作答次數決定用戶端 K 值（衰減制）"""
    return _USER_ELO_K_DECAY.get(answer_count, _USER_ELO_K_MIN)


def _apply_elo(
    user_rating: float,
    question_rating: float,
    correct: bool,
    user_answer_count: int,
    is_question_first_blood: bool,
):
    """非對稱 Elo 更新
    - 用戶端：K 值依 user_answer_count 衰減
    - 題目端：首殺絕對制，只有 is_question_first_blood=True 時才更新
    """
    actual = 1.0 if correct else 0.0
    expected = _elo_expected(user_rating, question_rating)
    k_user = _get_user_k(user_answer_count)
    new_user = user_rating + k_user * (actual - expected)
    if is_question_first_blood:
        new_question = question_rating + _QUESTION_ELO_K * (expected - actual)
    else:
        new_question = question_rating
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
    1: {'basic': 8, 'application': 2, 'complexity': 0},
    2: {'basic': 6, 'application': 3, 'complexity': 1},
    3: {'basic': 4, 'application': 4, 'complexity': 2},
    4: {'basic': 2, 'application': 5, 'complexity': 3},
    5: {'basic': 1, 'application': 4, 'complexity': 5},
}


def _serialize_questions(questions: list, lang: str) -> list[dict]:
    """將 Question ORM objects 序列化為 dict list（含 i18n）"""
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
    """回傳 tutorial 所有 active 題目（供管理後台用）"""
    questions = (
        Question.query
        .filter_by(tutorial_id=tutorial_id, is_active=True)
        .order_by(Question.display_order)
        .all()
    )
    return _serialize_questions(questions, lang)


def get_questions_for_user(tutorial_id: int, user, lang: str) -> list[dict]:
    """依 user skill_tier 選題，最多 1 個題組以連續區塊出現，總題數 ≤ _MAX_QUESTIONS"""
    tier = user.skill_tier or 1
    quota = CATEGORY_QUOTA[tier]

    all_q = Question.query.filter_by(tutorial_id=tutorial_id, is_active=True).all()

    # Step 0：分類題目
    grouped: dict[int, list] = {}   # group_id → list[Question]
    standalone: list = []
    for q in all_q:
        if q.group_id is not None:
            grouped.setdefault(q.group_id, []).append(q)
        else:
            standalone.append(q)

    # Step 1：題組資格過濾
    eligible_groups: list[tuple[float, int, list]] = []  # (avg_rating, group_id, questions)
    for gid, qs in grouped.items():
        cat_counts: dict[str, int] = {}
        for q in qs:
            cat = q.category.value
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
        eligible = all(
            cat_counts.get(cat, 0) <= quota.get(cat, 0) + _GROUP_TOLERANCE
            for cat in cat_counts
        )
        if eligible:
            avg_rating = sum(q.difficulty_rating for q in qs) / len(qs)
            eligible_groups.append((avg_rating, gid, qs))

    # Step 2：題組抽取（最接近 user skill_rating，50% 機率）
    selected_group_qs: list = []
    if eligible_groups:
        eligible_groups.sort(key=lambda x: abs(user.skill_rating - x[0]))
        if random.random() < _GROUP_INCLUDE_PROB:
            _, _, selected_group_qs = eligible_groups[0]
            selected_group_qs = sorted(selected_group_qs, key=lambda q: q.display_order)

    # Step 3：扣除題組配額
    remaining_quota = dict(quota)
    for q in selected_group_qs:
        cat = q.category.value
        remaining_quota[cat] = max(0, remaining_quota.get(cat, 0) - 1)

    # Step 4：獨立題填滿
    buckets: dict[str, list] = {'basic': [], 'application': [], 'complexity': []}
    for q in standalone:
        buckets[q.category.value].append(q)

    standalone_selected: list = []
    standalone_ids: set[int] = set()
    leftover = 0

    for cat, q_quota in remaining_quota.items():
        picked = _weighted_sample(buckets[cat], q_quota, user.skill_rating)
        leftover += q_quota - len(picked)
        standalone_selected.extend(picked)
        standalone_ids.update(q.question_id for q in picked)

    if leftover > 0:
        remaining = [q for q in standalone if q.question_id not in standalone_ids]
        standalone_selected.extend(_weighted_sample(remaining, leftover, user.skill_rating))

    # 獨立題上限：不超過 _MAX_QUESTIONS - 題組題數
    max_standalone = _MAX_QUESTIONS - len(selected_group_qs)
    standalone_selected = standalone_selected[:max_standalone]

    # Step 5：Block insert — 題組作為連續區塊插入打散的獨立題中
    random.shuffle(standalone_selected)
    if selected_group_qs:
        insert_pos = random.randint(0, len(standalone_selected))
        final = (
            standalone_selected[:insert_pos]
            + selected_group_qs
            + standalone_selected[insert_pos:]
        )
    else:
        final = standalone_selected

    return _serialize_questions(final, lang)


def _normalize(s: str) -> str:
    return str(s).replace(' ', '')


def _check_answer(user_answer, correct_answer: str) -> bool:
    """判斷 user_answer 是否正確

    correct_answer 格式有兩種：
    - 純字串（single-choice / true-false / predict-line）：用 | 分隔多個可接受答案
    - JSON 陣列字串（multiple-choice / fill-code）：["ans1", "ans2"]，
      由 seed_questions._serialize_answer 序列化而來，每個位置獨立比對
    """
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
    """判題、更新 Elo、發放 XP，回傳結果 dict不做 HTTP 驗證"""
    if not answers_input:
        raise ValueError("answers_input is empty")

    user = db.session.get(User, user_id, with_for_update=True)
    q_ids = [a['question_id'] for a in answers_input]
    questions = {
        q.question_id: q
        for q in Question.query.filter(
            Question.question_id.in_(q_ids),
            Question.tutorial_id == tutorial.tutorial_id,
        ).with_for_update().all()
    }
    translations = {
        qt.question_id: qt
        for qt in QuestionTranslation.query.filter(
            QuestionTranslation.question_id.in_(q_ids),
            QuestionTranslation.language_code == lang,
        ).all()
    }

    # 一次查出 user 對這批題目的歷史作答次數（用於 K 衰減 + 首殺判定）
    prior_answer_counts: dict[int, int] = {
        row.question_id: row.cnt
        for row in db.session.query(
            AttemptAnswer.question_id,
            func.count().label('cnt'),
        )
        .join(PracticeAttempt, AttemptAnswer.attempt_id == PracticeAttempt.attempt_id)
        .filter(
            PracticeAttempt.user_id == user_id,
            AttemptAnswer.question_id.in_(q_ids),
        )
        .group_by(AttemptAnswer.question_id)
        .all()
    }

    now = datetime.now(timezone.utc)
    original_user_rating = user.skill_rating
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

        prior_count = prior_answer_counts.get(q.question_id, 0)
        is_first_blood = prior_count == 0
        user_answer_count = prior_count + 1  # 包含本次

        new_user_rating, new_q_rating = _apply_elo(
            user_rating, snap_rating, is_correct,
            user_answer_count, is_first_blood,
        )
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

    # 及格保底：通過時 rating 只升不降
    if score >= _PASS_THRESHOLD:
        user_rating = max(original_user_rating, user_rating)

    rating_delta = round(user_rating - original_user_rating, 2)

    attempt = PracticeAttempt(
        user_id=user_id,
        tutorial_id=tutorial.tutorial_id,
        score=score,
        correct_count=correct_count,
        total_questions=len(answer_records),
        time_spent_seconds=total_time or None,
        user_rating_before=original_user_rating,
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
