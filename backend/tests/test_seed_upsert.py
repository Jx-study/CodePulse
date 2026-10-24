"""測試 seed_questions upsert 行為：UPDATE、INSERT、deactivate。"""
import pytest
import json


def _make_tutorial(db):
    from models.tutorial import Tutorial, AlgorithmCategory
    cat = AlgorithmCategory(category_id=1, slug='ds')
    db.session.add(cat)
    db.session.flush()
    t = Tutorial(
        tutorial_id=1, category_id=1, slug='array',
        difficulty=3, xp_teaching=10, xp_practice_base=20, xp_perfect_bonus=5,
    )
    db.session.add(t)
    db.session.commit()
    return t


def _make_question(db, tutorial_id, question_key, stem_zh, order=0):
    from models.question import Question, QuestionType, QuestionCategory, QuestionTranslation
    q = Question(
        tutorial_id=tutorial_id,
        question_key=question_key,
        question_type=QuestionType.single_choice,
        category=QuestionCategory.basic,
        base_rating=1000.0,
        difficulty_rating=1000.0,
        correct_answer='A',
        display_order=order,
        is_active=True,
    )
    db.session.add(q)
    db.session.flush()
    db.session.add(QuestionTranslation(
        question_id=q.question_id,
        language_code='zh-TW',
        stem=stem_zh,
        options=[{"id": "A", "text": "是"}, {"id": "B", "text": "否"}],
    ))
    db.session.commit()
    return q


def test_upsert_updates_existing_question(app):
    """同 question_key 再次 seed → UPDATE 文字，question_id 不變。"""
    from database import db
    from seeds.seed_questions import seed_tutorial
    from models.question import Question

    with app.app_context():
        t = _make_tutorial(db)
        original = _make_question(db, t.tutorial_id, 'array-q1', '舊題目文字')
        original_id = original.question_id

        quiz_data = {
            "slug": "array",
            "groups": [],
            "questions": [
                {
                    "id": "array-q1",
                    "type": "single-choice",
                    "baseRating": 1000,
                    "correctAnswer": "B",
                    "translations": {
                        "zh-TW": {
                            "title": "新題目文字",
                            "options": [{"id": "A", "text": "是"}, {"id": "B", "text": "否"}],
                            "explanation": "解釋",
                        }
                    },
                }
            ],
        }

        seed_tutorial(quiz_data)

        q = Question.query.filter_by(question_id=original_id).first()
        assert q is not None, "question_id 不應改變"
        assert q.correct_answer == 'B', "答案應被更新"
        zh = next(t for t in q.translations if t.language_code == 'zh-TW')
        assert zh.stem == '新題目文字', "題目文字應被更新"


def test_upsert_inserts_new_question(app):
    """seed data 有新 question_key → INSERT 新行，舊行不受影響。"""
    from database import db
    from seeds.seed_questions import seed_tutorial
    from models.question import Question

    with app.app_context():
        t = _make_tutorial(db)
        original = _make_question(db, t.tutorial_id, 'array-q1', '舊題目', order=0)
        original_id = original.question_id

        quiz_data = {
            "slug": "array",
            "groups": [],
            "questions": [
                {
                    "id": "array-q1",
                    "type": "single-choice",
                    "baseRating": 1000,
                    "correctAnswer": "A",
                    "translations": {"zh-TW": {"title": "舊題目", "options": []}},
                },
                {
                    "id": "array-q2",
                    "type": "true-false",
                    "baseRating": 900,
                    "correctAnswer": "true",
                    "translations": {"zh-TW": {"title": "全新題目", "options": []}},
                },
            ],
        }

        seed_tutorial(quiz_data)

        all_q = Question.query.filter_by(tutorial_id=t.tutorial_id).all()
        keys = {q.question_key for q in all_q}
        assert 'array-q1' in keys
        assert 'array-q2' in keys
        assert Question.query.filter_by(question_id=original_id).first() is not None


def test_upsert_deactivates_removed_question(app):
    """seed data 移除某題 → DB 行標 is_active=False，不刪除。"""
    from database import db
    from seeds.seed_questions import seed_tutorial
    from models.question import Question

    with app.app_context():
        t = _make_tutorial(db)
        removed = _make_question(db, t.tutorial_id, 'array-old', '被移除題目', order=0)
        removed_id = removed.question_id

        quiz_data = {
            "slug": "array",
            "groups": [],
            "questions": [
                {
                    "id": "array-q1",
                    "type": "single-choice",
                    "baseRating": 1000,
                    "correctAnswer": "A",
                    "translations": {"zh-TW": {"title": "保留題目", "options": []}},
                }
            ],
        }

        seed_tutorial(quiz_data)

        old_q = Question.query.filter_by(question_id=removed_id).first()
        assert old_q is not None, "不應被刪除"
        assert old_q.is_active is False, "應標為 is_active=False"
