"""Tests for practice_service core logic."""
import pytest


def test_derive_points_low():
    from services.practice_service import derive_points
    assert derive_points(800) == 1
    assert derive_points(1199.99) == 1


def test_derive_points_mid():
    from services.practice_service import derive_points
    assert derive_points(1200) == 2
    assert derive_points(1599.99) == 2


def test_derive_points_high():
    from services.practice_service import derive_points
    assert derive_points(1600) == 3
    assert derive_points(2000) == 3


def test_submit_answers_weighted_score(app):
    """加權計分：難題答對得分高於易題。"""
    from database import db
    from models.tutorial import Tutorial, AlgorithmCategory
    from models.question import Question, QuestionType, QuestionCategory
    from models.user import User, UserRole
    from services.practice_service import submit_answers

    with app.app_context():
        cat = AlgorithmCategory(category_id=1, slug='sorting')
        db.session.add(cat)
        db.session.flush()
        t = Tutorial(
            tutorial_id=1, category_id=1, slug='bubble-sort',
            difficulty=1, xp_teaching=10, xp_practice_base=20, xp_perfect_bonus=10,
        )
        db.session.add(t)
        user = User(
            user_id=1, username='u', display_name='U',
            email='u@test.com', role=UserRole.user,
            skill_rating=1200.0, skill_tier=1,
        )
        db.session.add(user)
        # 1 easy (points=1) + 1 hard (points=5)
        q_easy = Question(
            question_id=1, tutorial_id=1,
            question_type=QuestionType.single_choice,
            category=QuestionCategory.basic,
            base_rating=900.0, difficulty_rating=900.0,
            correct_answer='A', display_order=0, is_active=True,
        )
        q_hard = Question(
            question_id=2, tutorial_id=1,
            question_type=QuestionType.single_choice,
            category=QuestionCategory.basic,
            base_rating=1700.0, difficulty_rating=1700.0,
            correct_answer='B', display_order=1, is_active=True,
        )
        db.session.add_all([q_easy, q_hard])
        db.session.commit()

        # 只答對難題
        answers = [
            {'question_id': 1, 'user_answer': 'WRONG'},
            {'question_id': 2, 'user_answer': 'B'},
        ]
        result = submit_answers(t, user_id=1, answers_input=answers, lang='en')

        # total_points = 1 + 3 = 4, earned = 3, score = int(3/4*100) = 75
        assert result['score'] == 75
        assert result['correct_count'] == 1


def test_submit_answers_returns_all_questions(app):
    """submit_answers 回傳全部題目（含答對的），且每筆含 user_answer 和 points。"""
    from database import db
    from models.tutorial import Tutorial, AlgorithmCategory
    from models.question import Question, QuestionType, QuestionCategory
    from models.user import User, UserRole
    from services.practice_service import submit_answers

    with app.app_context():
        cat = AlgorithmCategory(category_id=2, slug='sorting2')
        db.session.add(cat)
        db.session.flush()
        t = Tutorial(
            tutorial_id=2, category_id=2, slug='test-slug',
            difficulty=1, xp_teaching=10, xp_practice_base=20, xp_perfect_bonus=10,
        )
        db.session.add(t)
        user = User(
            user_id=2, username='u2', display_name='U2',
            email='u2@test.com', role=UserRole.user,
            skill_rating=1200.0, skill_tier=1,
        )
        db.session.add(user)
        q = Question(
            question_id=10, tutorial_id=2,
            question_type=QuestionType.single_choice,
            category=QuestionCategory.basic,
            base_rating=1200.0, difficulty_rating=1200.0,
            correct_answer='A', display_order=0, is_active=True,
        )
        db.session.add(q)
        db.session.commit()

        answers = [{'question_id': 10, 'user_answer': 'A'}]
        result = submit_answers(t, user_id=2, answers_input=answers, lang='en')

        assert len(result['results']) == 1
        r = result['results'][0]
        assert r['is_correct'] is True
        assert 'user_answer' in r
        assert r['user_answer'] == 'A'
        assert 'points' in r
        assert r['points'] == 2  # difficulty_rating=1200 → points=2


def _make_questions_for_tier_test(db_session, tutorial):
    """建立 10 題：basic×6, application×3, complexity×1（tier 1 配額）。"""
    from models.question import Question, QuestionType, QuestionCategory
    questions = []
    for i in range(6):
        questions.append(Question(
            question_id=100+i, tutorial_id=tutorial.tutorial_id,
            question_type=QuestionType.single_choice,
            category=QuestionCategory.basic,
            base_rating=1200.0, difficulty_rating=1200.0,
            correct_answer='A', display_order=i, is_active=True,
        ))
    for i in range(3):
        questions.append(Question(
            question_id=200+i, tutorial_id=tutorial.tutorial_id,
            question_type=QuestionType.single_choice,
            category=QuestionCategory.application,
            base_rating=1200.0, difficulty_rating=1200.0,
            correct_answer='A', display_order=6+i, is_active=True,
        ))
    questions.append(Question(
        question_id=300, tutorial_id=tutorial.tutorial_id,
        question_type=QuestionType.single_choice,
        category=QuestionCategory.complexity,
        base_rating=1200.0, difficulty_rating=1200.0,
        correct_answer='A', display_order=9, is_active=True,
    ))
    for q in questions:
        db_session.add(q)
    db_session.flush()
    return questions


def test_get_questions_for_user_tier1_quota(app):
    """tier=1 時選 basic:6, application:3, complexity:1 共 10 題。"""
    from database import db
    from models.tutorial import Tutorial, AlgorithmCategory
    from models.user import User, UserRole
    from services.practice_service import get_questions_for_user

    with app.app_context():
        cat = AlgorithmCategory(category_id=10, slug='tier-test')
        db.session.add(cat)
        db.session.flush()
        t = Tutorial(
            tutorial_id=10, category_id=10, slug='tier-test',
            difficulty=3, xp_teaching=10, xp_practice_base=20, xp_perfect_bonus=10,
        )
        db.session.add(t)
        user = User(
            user_id=10, username='t1', display_name='T1',
            email='t1@test.com', role=UserRole.user,
            skill_rating=1000.0, skill_tier=1,
        )
        db.session.add(user)
        _make_questions_for_tier_test(db.session, t)
        db.session.commit()

        result = get_questions_for_user(t.tutorial_id, user, 'en')
        assert len(result) == 10


def test_get_questions_for_user_none_tier_defaults_to_1(app):
    """skill_tier=None 的新用戶不應該 KeyError，應 fallback 到 tier 1。"""
    from database import db
    from models.tutorial import Tutorial, AlgorithmCategory
    from models.user import User, UserRole
    from services.practice_service import get_questions_for_user

    with app.app_context():
        cat = AlgorithmCategory(category_id=11, slug='tier-none-test')
        db.session.add(cat)
        db.session.flush()
        t = Tutorial(
            tutorial_id=11, category_id=11, slug='tier-none',
            difficulty=1, xp_teaching=10, xp_practice_base=20, xp_perfect_bonus=10,
        )
        db.session.add(t)
        user = User(
            user_id=11, username='tnone', display_name='TNone',
            email='tnone@test.com', role=UserRole.user,
            skill_rating=1000.0, skill_tier=1,
        )
        db.session.add(user)
        # 故意設為 None
        user.skill_tier = None
        _make_questions_for_tier_test(db.session, t)
        db.session.commit()

        # 不應該 raise KeyError
        result = get_questions_for_user(t.tutorial_id, user, 'en')
        assert len(result) == 10


# ---------------------------------------------------------------------------
# _check_answer unit tests
# ---------------------------------------------------------------------------

def test_check_answer_single_choice_correct():
    from services.practice_service import _check_answer
    assert _check_answer('A', 'A') is True


def test_check_answer_single_choice_wrong():
    from services.practice_service import _check_answer
    assert _check_answer('B', 'A') is False


def test_check_answer_normalizes_spaces():
    """空白被 strip，i-1 與 i - 1 視為相同。"""
    from services.practice_service import _check_answer
    assert _check_answer('i - 1', 'i-1') is True
    assert _check_answer('left<=right', 'left <= right') is True


def test_check_answer_pipe_multiple_accepted():
    """`correct_answer` 以 | 分隔多個可接受答案。"""
    from services.practice_service import _check_answer
    assert _check_answer('O(n^2)', 'O(n^2)|O(n*n)|O(n**2)') is True
    assert _check_answer('O(n*n)', 'O(n^2)|O(n*n)|O(n**2)') is True
    assert _check_answer('O(n)', 'O(n^2)|O(n*n)|O(n**2)') is False


def test_check_answer_true_false_correct():
    from services.practice_service import _check_answer
    assert _check_answer('true', 'true') is True
    assert _check_answer('false', 'true') is False


def test_check_answer_predict_line_space_normalize():
    """predict-line 答案，多餘空白被 strip 後相等。"""
    from services.practice_service import _check_answer
    assert _check_answer('1 3 5 7', '1 3 5 7') is True
    # 空格被 strip，'1357' == '1357'
    assert _check_answer('1357', '1 3 5 7') is True


def test_check_answer_fill_code_single_blank():
    """fill-code 單一空格，空白正規化後比對。"""
    from services.practice_service import _check_answer
    assert _check_answer('mid', 'mid') is True
    assert _check_answer('mid ', 'mid') is True  # trailing space stripped


# ---------------------------------------------------------------------------
# submit_answers with question_type variants
# ---------------------------------------------------------------------------

def _make_base_fixtures(db_session, cat_id, slug, tutorial_id, user_id, username, email):
    """建立 AlgorithmCategory / Tutorial / User，回傳 (tutorial, user)。"""
    from models.tutorial import Tutorial, AlgorithmCategory
    from models.user import User, UserRole

    cat = AlgorithmCategory(category_id=cat_id, slug=slug + '-cat')
    db_session.add(cat)
    db_session.flush()
    t = Tutorial(
        tutorial_id=tutorial_id, category_id=cat_id, slug=slug,
        difficulty=1, xp_teaching=10, xp_practice_base=20, xp_perfect_bonus=10,
    )
    db_session.add(t)
    user = User(
        user_id=user_id, username=username, display_name=username.upper(),
        email=email, role=UserRole.user,
        skill_rating=1200.0, skill_tier=1,
    )
    db_session.add(user)
    return t, user


def test_submit_answers_true_false_correct(app):
    """true-false 題型：答 'true' 對應 correct_answer='true' 算對。"""
    from database import db
    from models.question import Question, QuestionType, QuestionCategory
    from services.practice_service import submit_answers

    with app.app_context():
        t, user = _make_base_fixtures(
            db.session, cat_id=20, slug='tf-test',
            tutorial_id=20, user_id=20, username='tf1', email='tf1@test.com',
        )
        q = Question(
            question_id=20, tutorial_id=20,
            question_type=QuestionType.true_false,
            category=QuestionCategory.basic,
            base_rating=1000.0, difficulty_rating=1000.0,
            correct_answer='true', display_order=0, is_active=True,
        )
        db.session.add(q)
        db.session.commit()

        result = submit_answers(t, user_id=20, answers_input=[
            {'question_id': 20, 'user_answer': 'true'},
        ], lang='en')
        assert result['correct_count'] == 1
        assert result['score'] == 100


def test_submit_answers_true_false_wrong(app):
    """true-false 題型：答 'false' 當 correct='true' 算錯。"""
    from database import db
    from models.question import Question, QuestionType, QuestionCategory
    from services.practice_service import submit_answers

    with app.app_context():
        t, user = _make_base_fixtures(
            db.session, cat_id=21, slug='tf-test2',
            tutorial_id=21, user_id=21, username='tf2', email='tf2@test.com',
        )
        q = Question(
            question_id=21, tutorial_id=21,
            question_type=QuestionType.true_false,
            category=QuestionCategory.basic,
            base_rating=1000.0, difficulty_rating=1000.0,
            correct_answer='true', display_order=0, is_active=True,
        )
        db.session.add(q)
        db.session.commit()

        result = submit_answers(t, user_id=21, answers_input=[
            {'question_id': 21, 'user_answer': 'false'},
        ], lang='en')
        assert result['correct_count'] == 0
        assert result['score'] == 0


def test_submit_answers_predict_line_space_normalize(app):
    """predict-line：多餘空白被 strip 後相同視為正確。"""
    from database import db
    from models.question import Question, QuestionType, QuestionCategory
    from services.practice_service import submit_answers

    with app.app_context():
        t, user = _make_base_fixtures(
            db.session, cat_id=22, slug='pl-test',
            tutorial_id=22, user_id=22, username='pl1', email='pl1@test.com',
        )
        q = Question(
            question_id=22, tutorial_id=22,
            question_type=QuestionType.predict_line,
            category=QuestionCategory.basic,
            base_rating=1000.0, difficulty_rating=1000.0,
            correct_answer='1 3 5 7', display_order=0, is_active=True,
        )
        db.session.add(q)
        db.session.commit()

        # 使用者輸入有多餘空格
        result = submit_answers(t, user_id=22, answers_input=[
            {'question_id': 22, 'user_answer': '1  3  5  7'},
        ], lang='en')
        # _normalize strips all spaces → '1357' == '1357'
        assert result['correct_count'] == 1


def test_submit_answers_fill_code_pipe_variants(app):
    """fill-code：correct_answer 含 | 多答案，任一皆算對。"""
    from database import db
    from models.question import Question, QuestionType, QuestionCategory
    from services.practice_service import submit_answers

    with app.app_context():
        t, user = _make_base_fixtures(
            db.session, cat_id=23, slug='fc-test',
            tutorial_id=23, user_id=23, username='fc1', email='fc1@test.com',
        )
        q = Question(
            question_id=23, tutorial_id=23,
            question_type=QuestionType.fill_code,
            category=QuestionCategory.complexity,
            base_rating=1400.0, difficulty_rating=1400.0,
            correct_answer='O(n^2)|O(n*n)|O(n**2)', display_order=0, is_active=True,
        )
        db.session.add(q)
        db.session.commit()

        for variant in ['O(n^2)', 'O(n*n)', 'O(n**2)', 'O(n * n)']:
            # reset attempt state between variants by re-querying fresh user
            result = submit_answers(t, user_id=23, answers_input=[
                {'question_id': 23, 'user_answer': variant},
            ], lang='en')
            assert result['correct_count'] == 1, f"Expected correct for variant: {variant}"


def test_check_answer_multiple_choice_json_serialized():
    """multiple-choice correct_answer 以 JSON 陣列字串存入 DB（'["A", "C"]'）。
    _check_answer 會解析 JSON 後做 normalize + 排序比對，空格差異不影響結果。
    前端應傳入逗號分隔字串（'A,C'）或 JSON 陣列字串（'["A","C"]'）。
    """
    from services.practice_service import _check_answer
    import json

    correct_in_db = json.dumps(["A", "C"], ensure_ascii=False)  # '["A", "C"]'

    # 前端傳單個選項 → 長度不符 → False
    assert _check_answer('A', correct_in_db) is False
    assert _check_answer('C', correct_in_db) is False

    # 前端傳逗號分隔 → 正確
    assert _check_answer('A,C', correct_in_db) is True
    assert _check_answer('C,A', correct_in_db) is True  # 順序無關

    # 前端傳 JSON 字串 → 正確（空格差異不影響，兩者都能解析）
    assert _check_answer('["A","C"]', correct_in_db) is True
    assert _check_answer('["C","A"]', correct_in_db) is True


# ---------------------------------------------------------------------------
# get_questions_for_user — group-aware tests
# ---------------------------------------------------------------------------

def _make_group_fixtures(db_session, tutorial_id, cat_id):
    """建立 tutorial 標準獨立題池：basic×6, application×3, complexity×1。"""
    from models.question import Question, QuestionType, QuestionCategory
    base_id = tutorial_id * 1000
    questions = []
    for i in range(6):
        questions.append(Question(
            question_id=base_id + i, tutorial_id=tutorial_id,
            question_type=QuestionType.single_choice,
            category=QuestionCategory.basic,
            base_rating=1000.0, difficulty_rating=1000.0,
            correct_answer='A', display_order=i, is_active=True,
        ))
    for i in range(3):
        questions.append(Question(
            question_id=base_id + 10 + i, tutorial_id=tutorial_id,
            question_type=QuestionType.single_choice,
            category=QuestionCategory.application,
            base_rating=1200.0, difficulty_rating=1200.0,
            correct_answer='A', display_order=6 + i, is_active=True,
        ))
    questions.append(Question(
        question_id=base_id + 20, tutorial_id=tutorial_id,
        question_type=QuestionType.single_choice,
        category=QuestionCategory.complexity,
        base_rating=1400.0, difficulty_rating=1400.0,
        correct_answer='A', display_order=9, is_active=True,
    ))
    for q in questions:
        db_session.add(q)
    db_session.flush()
    return questions


def test_no_groups_returns_10_questions(app):
    """無題組時，get_questions_for_user 行為與現有邏輯相同，回傳 10 題。"""
    from database import db
    from models.tutorial import Tutorial, AlgorithmCategory
    from models.user import User, UserRole
    from services.practice_service import get_questions_for_user

    with app.app_context():
        cat = AlgorithmCategory(category_id=50, slug='no-group-cat')
        db.session.add(cat)
        db.session.flush()
        t = Tutorial(
            tutorial_id=50, category_id=50, slug='no-group',
            difficulty=1, xp_teaching=10, xp_practice_base=20, xp_perfect_bonus=10,
        )
        db.session.add(t)
        user = User(
            user_id=50, username='ng1', display_name='NG1',
            email='ng1@test.com', role=UserRole.user,
            skill_rating=1000.0, skill_tier=1,
        )
        db.session.add(user)
        _make_group_fixtures(db.session, tutorial_id=50, cat_id=50)
        db.session.commit()

        result = get_questions_for_user(t.tutorial_id, user, 'en')
        assert len(result) == 10


def _make_group_with_questions(db_session, tutorial_id, group_id, categories_and_ratings):
    """
    建立一個 QuestionGroup 及其題目。
    categories_and_ratings: list of (QuestionCategory, difficulty_rating)
    回傳 (group, questions)
    """
    from models.question import Question, QuestionType, QuestionCategory, QuestionGroup

    grp = QuestionGroup(
        group_id=group_id,
        tutorial_id=tutorial_id,
        display_order=0,
    )
    db_session.add(grp)
    db_session.flush()

    questions = []
    for idx, (cat, rating) in enumerate(categories_and_ratings):
        q = Question(
            question_id=group_id * 100 + idx,
            tutorial_id=tutorial_id,
            group_id=group_id,
            question_type=QuestionType.single_choice,
            category=cat,
            base_rating=rating, difficulty_rating=rating,
            correct_answer='A', display_order=idx, is_active=True,
        )
        db_session.add(q)
        questions.append(q)
    db_session.flush()
    return grp, questions


def test_group_included_total_not_exceed_10(app):
    """題組 3 題帶入後，總題數不超過 10。"""
    from database import db
    from models.tutorial import Tutorial, AlgorithmCategory
    from models.question import QuestionCategory
    from models.user import User, UserRole
    from services.practice_service import get_questions_for_user
    import unittest.mock as mock

    with app.app_context():
        cat = AlgorithmCategory(category_id=51, slug='grp-cap-cat')
        db.session.add(cat)
        db.session.flush()
        t = Tutorial(
            tutorial_id=51, category_id=51, slug='grp-cap',
            difficulty=1, xp_teaching=10, xp_practice_base=20, xp_perfect_bonus=10,
        )
        db.session.add(t)
        user = User(
            user_id=51, username='gc1', display_name='GC1',
            email='gc1@test.com', role=UserRole.user,
            skill_rating=1200.0, skill_tier=1,
        )
        db.session.add(user)
        _make_group_fixtures(db.session, tutorial_id=51, cat_id=51)
        _make_group_with_questions(
            db.session, tutorial_id=51, group_id=51,
            categories_and_ratings=[
                (QuestionCategory.application, 1200.0),
                (QuestionCategory.application, 1200.0),
                (QuestionCategory.complexity, 1400.0),
            ],
        )
        db.session.commit()

        with mock.patch('services.practice_service.random.random', return_value=0.0):
            result = get_questions_for_user(t.tutorial_id, user, 'en')

        assert len(result) <= 10


def test_group_questions_appear_contiguously(app):
    """題組 3 題在最終結果中必須連續出現（不被獨立題穿插）。"""
    from database import db
    from models.tutorial import Tutorial, AlgorithmCategory
    from models.question import QuestionCategory, QuestionGroup
    from models.user import User, UserRole
    from services.practice_service import get_questions_for_user
    import unittest.mock as mock

    with app.app_context():
        cat = AlgorithmCategory(category_id=52, slug='grp-cont-cat')
        db.session.add(cat)
        db.session.flush()
        t = Tutorial(
            tutorial_id=52, category_id=52, slug='grp-cont',
            difficulty=1, xp_teaching=10, xp_practice_base=20, xp_perfect_bonus=10,
        )
        db.session.add(t)
        user = User(
            user_id=52, username='gc2', display_name='GC2',
            email='gc2@test.com', role=UserRole.user,
            skill_rating=1200.0, skill_tier=1,
        )
        db.session.add(user)
        _make_group_fixtures(db.session, tutorial_id=52, cat_id=52)
        grp, grp_qs = _make_group_with_questions(
            db.session, tutorial_id=52, group_id=52,
            categories_and_ratings=[
                (QuestionCategory.application, 1200.0),
                (QuestionCategory.application, 1200.0),
                (QuestionCategory.complexity, 1400.0),
            ],
        )
        db.session.commit()

        grp_q_ids = {q.question_id for q in grp_qs}

        with mock.patch('services.practice_service.random.random', return_value=0.0):
            result = get_questions_for_user(t.tutorial_id, user, 'en')

        group_indices = [i for i, q in enumerate(result) if q['question_id'] in grp_q_ids]
        assert len(group_indices) == 3
        assert max(group_indices) - min(group_indices) == 2


def test_group_not_included_when_probability_misses(app):
    """random.random() > _GROUP_INCLUDE_PROB 時，不帶入題組，回傳純獨立題。"""
    from database import db
    from models.tutorial import Tutorial, AlgorithmCategory
    from models.question import QuestionCategory
    from models.user import User, UserRole
    from services.practice_service import get_questions_for_user
    import unittest.mock as mock

    with app.app_context():
        cat = AlgorithmCategory(category_id=53, slug='grp-miss-cat')
        db.session.add(cat)
        db.session.flush()
        t = Tutorial(
            tutorial_id=53, category_id=53, slug='grp-miss',
            difficulty=1, xp_teaching=10, xp_practice_base=20, xp_perfect_bonus=10,
        )
        db.session.add(t)
        user = User(
            user_id=53, username='gm1', display_name='GM1',
            email='gm1@test.com', role=UserRole.user,
            skill_rating=1200.0, skill_tier=1,
        )
        db.session.add(user)
        _make_group_fixtures(db.session, tutorial_id=53, cat_id=53)
        grp, grp_qs = _make_group_with_questions(
            db.session, tutorial_id=53, group_id=53,
            categories_and_ratings=[
                (QuestionCategory.application, 1200.0),
                (QuestionCategory.application, 1200.0),
                (QuestionCategory.complexity, 1400.0),
            ],
        )
        db.session.commit()

        grp_q_ids = {q.question_id for q in grp_qs}

        with mock.patch('services.practice_service.random.random', return_value=0.9):
            result = get_questions_for_user(t.tutorial_id, user, 'en')

        result_ids = {q['question_id'] for q in result}
        assert not grp_q_ids.intersection(result_ids), "題組題不應出現在結果中"
        assert len(result) == 10


def test_group_filtered_out_when_exceeds_tolerance(app):
    """題組在某 category 超出配額 + tolerance，應被過濾，不出現在結果中。"""
    from database import db
    from models.tutorial import Tutorial, AlgorithmCategory
    from models.question import QuestionCategory
    from models.user import User, UserRole
    from services.practice_service import get_questions_for_user, CATEGORY_QUOTA, _GROUP_TOLERANCE
    import unittest.mock as mock

    with app.app_context():
        cat = AlgorithmCategory(category_id=54, slug='grp-filter-cat')
        db.session.add(cat)
        db.session.flush()
        t = Tutorial(
            tutorial_id=54, category_id=54, slug='grp-filter',
            difficulty=1, xp_teaching=10, xp_practice_base=20, xp_perfect_bonus=10,
        )
        db.session.add(t)
        user = User(
            user_id=54, username='gf1', display_name='GF1',
            email='gf1@test.com', role=UserRole.user,
            skill_rating=1800.0, skill_tier=5,
        )
        db.session.add(user)
        from models.question import Question, QuestionType
        for i in range(1):
            db.session.add(Question(
                question_id=54000 + i, tutorial_id=54,
                question_type=QuestionType.single_choice,
                category=QuestionCategory.basic,
                base_rating=800.0, difficulty_rating=800.0,
                correct_answer='A', display_order=i, is_active=True,
            ))
        for i in range(4):
            db.session.add(Question(
                question_id=54010 + i, tutorial_id=54,
                question_type=QuestionType.single_choice,
                category=QuestionCategory.application,
                base_rating=1200.0, difficulty_rating=1200.0,
                correct_answer='A', display_order=1 + i, is_active=True,
            ))
        for i in range(5):
            db.session.add(Question(
                question_id=54020 + i, tutorial_id=54,
                question_type=QuestionType.single_choice,
                category=QuestionCategory.complexity,
                base_rating=1600.0, difficulty_rating=1600.0,
                correct_answer='A', display_order=5 + i, is_active=True,
            ))
        grp, grp_qs = _make_group_with_questions(
            db.session, tutorial_id=54, group_id=54,
            categories_and_ratings=[
                (QuestionCategory.basic, 900.0),
                (QuestionCategory.basic, 900.0),
                (QuestionCategory.basic, 900.0),
            ],
        )
        db.session.commit()

        grp_q_ids = {q.question_id for q in grp_qs}

        with mock.patch('services.practice_service.random.random', return_value=0.0):
            result = get_questions_for_user(t.tutorial_id, user, 'en')

        result_ids = {q['question_id'] for q in result}
        assert not grp_q_ids.intersection(result_ids), "超出 tolerance 的題組不應出現"


def test_submit_answers_multiple_choice_pipe_workaround(app):
    """multiple-choice 的可用 workaround：直接在 DB 用 | 格式儲存（手動繞過 seed）。
    correct_answer='A|C' → _check_answer split → ['A', 'C']，
    前端傳 user_answer='A' 或 'C' 皆算對（任一匹配語義，非「同時選」語義）。

    注意：這不是「同時必選 A 和 C」的語義，只是「A 或 C 都算對」。
    """
    from database import db
    from models.question import Question, QuestionType, QuestionCategory
    from services.practice_service import submit_answers

    with app.app_context():
        t, user = _make_base_fixtures(
            db.session, cat_id=24, slug='mc-test',
            tutorial_id=24, user_id=24, username='mc1', email='mc1@test.com',
        )
        q = Question(
            question_id=24, tutorial_id=24,
            question_type=QuestionType.multiple_choice,
            category=QuestionCategory.application,
            base_rating=1200.0, difficulty_rating=1200.0,
            correct_answer='A|C',  # 手動用 | 格式，非 seed 的 JSON 格式
            display_order=0, is_active=True,
        )
        db.session.add(q)
        db.session.commit()

        result = submit_answers(t, user_id=24, answers_input=[
            {'question_id': 24, 'user_answer': 'A'},
        ], lang='en')
        assert result['correct_count'] == 1
