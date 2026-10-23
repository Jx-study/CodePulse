"""AVL 題庫真的能寫進資料庫，而且每題的標準答案都會被判對。"""
import json


def _seed_avl(db):
    from models.tutorial import Tutorial, AlgorithmCategory
    from seeds.questions import avl
    from seeds.seed_questions import seed_tutorial

    db.session.add(AlgorithmCategory(category_id=1, slug='ds'))
    db.session.flush()
    db.session.add(Tutorial(
        tutorial_id=1, category_id=1, slug='avl-tree',
        difficulty=4, xp_teaching=10, xp_practice_base=20, xp_perfect_bonus=5,
    ))
    db.session.commit()
    seed_tutorial(avl.DATA)
    return avl.DATA


def test_avl_questions_are_seeded_in_both_languages(app):
    from database import db
    from models.question import Question

    with app.app_context():
        data = _seed_avl(db)

        questions = Question.query.filter_by(tutorial_id=1, is_active=True).all()

        assert len(questions) == len(data["questions"]) == 30
        for q in questions:
            assert {t.language_code for t in q.translations} == {"zh-TW", "en"}
            assert q.difficulty_rating > 0


def test_seeding_avl_twice_changes_nothing(app):
    from database import db
    from models.question import Question
    from seeds.questions import avl
    from seeds.seed_questions import seed_tutorial

    with app.app_context():
        _seed_avl(db)
        before = {q.question_key: q.question_id for q in Question.query.all()}

        seed_tutorial(avl.DATA)

        after = {q.question_key: q.question_id for q in Question.query.all()}
        assert before == after


def test_the_stored_answer_of_every_avl_question_is_graded_correct(app):
    from database import db
    from models.question import Question
    from services.practice_service import _check_answer

    with app.app_context():
        data = _seed_avl(db)
        by_key = {q["id"]: q for q in data["questions"]}

        for stored in Question.query.filter_by(tutorial_id=1).all():
            seed_q = by_key[stored.question_key]
            answer = seed_q["correctAnswer"]
            submitted = json.dumps(answer) if isinstance(answer, list) else answer

            assert _check_answer(
                submitted, stored.correct_answer, stored.question_type
            ), stored.question_key


def test_a_wrong_answer_is_graded_wrong(app):
    from database import db
    from models.question import Question
    from services.practice_service import _check_answer

    with app.app_context():
        _seed_avl(db)
        single = Question.query.filter_by(
            tutorial_id=1, question_key="avl-tree-q20"
        ).first()
        fill = Question.query.filter_by(
            tutorial_id=1, question_key="avl-tree-q14"
        ).first()

        assert not _check_answer("D", single.correct_answer, single.question_type)
        assert not _check_answer(
            json.dumps(["y", "x.right", "x"]), fill.correct_answer, fill.question_type
        )
