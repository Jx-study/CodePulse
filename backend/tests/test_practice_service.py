"""Tests for practice_service core logic."""
import pytest


def test_derive_points_low():
    from services.practice_service import derive_points
    assert derive_points(800) == 1
    assert derive_points(1199.99) == 1


def test_derive_points_mid():
    from services.practice_service import derive_points
    assert derive_points(1200) == 3
    assert derive_points(1599.99) == 3


def test_derive_points_high():
    from services.practice_service import derive_points
    assert derive_points(1600) == 5
    assert derive_points(2000) == 5


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

        # total_points = 1 + 5 = 6, earned = 5, score = round(5/6*100) = 83
        assert result['score'] == 83
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
        assert r['points'] == 3  # difficulty_rating=1200 → points=3


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
