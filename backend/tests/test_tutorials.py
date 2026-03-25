import pytest
from database import db as _db


def _authed(client, auth_headers, method, path, **kwargs):
    token = auth_headers['access_token']
    client.set_cookie('access_token', token)
    fn = getattr(client, method)
    resp = fn(path, **kwargs)
    client.delete_cookie('access_token')
    return resp


def test_blueprint_registered(client):
    """Blueprint 已掛載（401 = login_required 生效）。"""
    resp = client.get('/api/tutorials/bubble-sort/questions')
    assert resp.status_code == 401


from datetime import datetime, timezone


def _make_tutorial(db_session, slug='bubble-sort', category_id=1):
    from models.tutorial import Tutorial, AlgorithmCategory
    cat = AlgorithmCategory(category_id=category_id, slug='sorting')
    db_session.add(cat)
    db_session.flush()
    t = Tutorial(
        tutorial_id=1, category_id=cat.category_id, slug=slug,
        difficulty=1, xp_teaching=10, xp_practice_base=20, xp_perfect_bonus=10,
    )
    db_session.add(t)
    db_session.flush()
    return t


def test_get_user_progress_empty(client, auth_headers, app):
    with app.app_context():
        _make_tutorial(_db.session)
        _db.session.commit()

    resp = _authed(client, auth_headers, 'get', '/api/users/me/progress')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['success'] is True
    assert data['progress'] == []


def test_get_user_progress_with_data(client, auth_headers, app):
    from models.tutorial import UserTutorialProgress
    with app.app_context():
        t = _make_tutorial(_db.session)
        # user_id=1 matches the hardcoded user_id=1 created in conftest fixtures.
        # progress_id=1 is required explicitly because SQLite BigInteger PKs
        # do not autoincrement without the INTEGER PRIMARY KEY declaration.
        p = UserTutorialProgress(
            progress_id=1,
            user_id=1, tutorial_id=t.tutorial_id,
            teaching_completed=True, best_score=85,
            best_time_seconds=120, attempt_count=2,
            practice_passed=False,
        )
        _db.session.add(p)
        _db.session.commit()

    resp = _authed(client, auth_headers, 'get', '/api/users/me/progress')
    assert resp.status_code == 200
    items = resp.get_json()['progress']
    assert len(items) == 1
    assert items[0]['tutorial_slug'] == 'bubble-sort'
    assert items[0]['teaching_completed'] is True
    assert items[0]['best_score'] == 85
    assert items[0]['practice_passed'] is False
    assert items[0]['attempt_count'] == 2


def test_create_session(client, auth_headers, app):
    with app.app_context():
        _make_tutorial(_db.session)
        _db.session.commit()

    resp = _authed(client, auth_headers, 'post', '/api/tutorials/bubble-sort/session',
                   json={'mode': 'teaching'})
    assert resp.status_code == 201
    data = resp.get_json()
    assert data['success'] is True
    assert 'session_id' in data


def test_create_session_unknown_slug(client, auth_headers, app):
    with app.app_context():
        _make_tutorial(_db.session)
        _db.session.commit()

    resp = _authed(client, auth_headers, 'post', '/api/tutorials/nonexistent/session',
                   json={'mode': 'teaching'})
    assert resp.status_code == 404


def test_patch_session(client, auth_headers, app):
    from models.practice import LearningSession, SessionMode
    with app.app_context():
        t = _make_tutorial(_db.session)
        sess = LearningSession(
            user_id=1, tutorial_id=t.tutorial_id,
            mode=SessionMode.teaching,
            started_at=datetime.now(timezone.utc),
        )
        _db.session.add(sess)
        _db.session.commit()
        session_id = sess.session_id

    resp = _authed(client, auth_headers, 'patch',
                   f'/api/tutorials/bubble-sort/session/{session_id}',
                   json={'duration_seconds': 90})
    assert resp.status_code == 200
    assert resp.get_json()['success'] is True


def _make_teaching_session(db_session, user_id, tutorial_id, seconds_ago=60):
    from models.practice import LearningSession, SessionMode
    from datetime import timedelta
    sess = LearningSession(
        user_id=user_id,
        tutorial_id=tutorial_id,
        mode=SessionMode.teaching,
        started_at=datetime.now(timezone.utc) - timedelta(seconds=seconds_ago),
    )
    db_session.add(sess)
    db_session.flush()
    return sess


def test_teaching_complete_no_session_returns_403(client, auth_headers, app):
    with app.app_context():
        _make_tutorial(_db.session)
        _db.session.commit()

    resp = _authed(client, auth_headers, 'patch',
                   '/api/tutorials/bubble-sort/teaching-complete')
    assert resp.status_code == 403


def test_teaching_complete_too_fast_returns_403(client, auth_headers, app):
    with app.app_context():
        t = _make_tutorial(_db.session)
        _make_teaching_session(_db.session, user_id=1, tutorial_id=t.tutorial_id, seconds_ago=10)
        _db.session.commit()

    resp = _authed(client, auth_headers, 'patch',
                   '/api/tutorials/bubble-sort/teaching-complete')
    assert resp.status_code == 403


def test_teaching_complete_awards_xp(client, auth_headers, app):
    from models.tutorial import UserTutorialProgress
    from models.xp import XpEvent
    with app.app_context():
        t = _make_tutorial(_db.session)
        _make_teaching_session(_db.session, user_id=1, tutorial_id=t.tutorial_id, seconds_ago=60)
        _db.session.commit()

    resp = _authed(client, auth_headers, 'patch',
                   '/api/tutorials/bubble-sort/teaching-complete')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['success'] is True
    assert data['xp_earned'] == 10  # xp_teaching = 10（由 fixture 設定）

    with app.app_context():
        utp = UserTutorialProgress.query.filter_by(user_id=1).first()
        assert utp.teaching_completed is True
        events = XpEvent.query.filter_by(user_id=1).all()
        assert len(events) == 1
        assert events[0].xp_amount == 10


def test_teaching_complete_idempotent(client, auth_headers, app):
    from models.xp import XpEvent
    with app.app_context():
        t = _make_tutorial(_db.session)
        _make_teaching_session(_db.session, user_id=1, tutorial_id=t.tutorial_id, seconds_ago=60)
        _db.session.commit()

    _authed(client, auth_headers, 'patch', '/api/tutorials/bubble-sort/teaching-complete')
    resp2 = _authed(client, auth_headers, 'patch', '/api/tutorials/bubble-sort/teaching-complete')
    assert resp2.status_code == 200
    assert resp2.get_json()['xp_earned'] == 0  # 不重複發放

    with app.app_context():
        events = XpEvent.query.filter_by(user_id=1).all()
        assert len(events) == 1  # 仍然只有一筆 XP 事件


def _make_question(db_session, tutorial_id, q_id=1, group_id=None):
    from models.question import Question, QuestionType, QuestionCategory, QuestionTranslation
    q = Question(
        question_type=QuestionType.single_choice,
        tutorial_id=tutorial_id,
        group_id=group_id,
        category=QuestionCategory.basic,
        correct_answer='A',
        base_rating=1200.0,
        display_order=0,
        is_active=True,
    )
    db_session.add(q)
    db_session.flush()
    qt = QuestionTranslation(
        question_id=q.question_id,
        language_code='en',
        stem='What is bubble sort?',
        options=[{'key': 'A', 'text': 'A sort'}, {'key': 'B', 'text': 'Not a sort'}],
        explanation='Bubble sort is a sorting algorithm.',
    )
    db_session.add(qt)
    return q


def test_get_questions_excludes_answer(client, auth_headers, app):
    with app.app_context():
        t = _make_tutorial(_db.session)
        _make_question(_db.session, t.tutorial_id)
        _db.session.commit()

    resp = _authed(client, auth_headers, 'get',
                   '/api/tutorials/bubble-sort/questions?lang=en')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['success'] is True
    questions = data['questions']
    assert len(questions) == 1
    q = questions[0]
    assert 'correct_answer' not in q
    assert 'explanation' not in q
    assert q['stem'] == 'What is bubble sort?'
    assert q['question_type'] == 'single-choice'


def test_get_questions_with_group(client, auth_headers, app):
    from models.question import QuestionGroup, QuestionGroupTranslation
    with app.app_context():
        t = _make_tutorial(_db.session)
        grp = QuestionGroup(tutorial_id=t.tutorial_id, code='x = 1', language='python')
        _db.session.add(grp)
        _db.session.flush()
        grp_t = QuestionGroupTranslation(
            group_id=grp.group_id, language_code='en',
            title='Group 1', description='A group',
        )
        _db.session.add(grp_t)
        _make_question(_db.session, t.tutorial_id, group_id=grp.group_id)
        _db.session.commit()

    resp = _authed(client, auth_headers, 'get',
                   '/api/tutorials/bubble-sort/questions?lang=en')
    q = resp.get_json()['questions'][0]
    assert q['group'] is not None
    assert q['group']['title'] == 'Group 1'
    assert q['group']['code'] == 'x = 1'


def test_submit_practice_pass(client, auth_headers, app):
    """得分 >= 60 → practice_passed，發放 XP。"""
    with app.app_context():
        t = _make_tutorial(_db.session)
        _make_question(_db.session, t.tutorial_id)
        _db.session.commit()

    payload = [{'question_id': 1, 'user_answer': 'A', 'time_spent_seconds': 10}]
    resp = _authed(client, auth_headers, 'post',
                   '/api/tutorials/bubble-sort/submit', json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['success'] is True
    assert data['score'] == 100
    assert data['correct_count'] == 1
    assert data['xp_earned'] > 0
    assert len(data['results']) == 1
    assert data['results'][0]['is_correct'] is True
    assert 'explanation' in data['results'][0]


def test_submit_practice_fail(client, auth_headers, app):
    """得分 < 60 → practice_passed 維持 False，無 practice_pass XP。"""
    from models.xp import XpEvent, XpSourceType
    with app.app_context():
        t = _make_tutorial(_db.session)
        _make_question(_db.session, t.tutorial_id)
        _db.session.commit()

    payload = [{'question_id': 1, 'user_answer': 'B', 'time_spent_seconds': 5}]
    resp = _authed(client, auth_headers, 'post',
                   '/api/tutorials/bubble-sort/submit', json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['score'] == 0
    assert data['xp_earned'] == 0

    with app.app_context():
        events = XpEvent.query.filter_by(
            user_id=1, source_type=XpSourceType.practice_pass
        ).all()
        assert len(events) == 0


def test_submit_practice_xp_idempotent(client, auth_headers, app):
    """第二次通過不再重複發放 practice_pass XP。"""
    from models.xp import XpEvent, XpSourceType
    with app.app_context():
        t = _make_tutorial(_db.session)
        _make_question(_db.session, t.tutorial_id)
        _db.session.commit()

    payload = [{'question_id': 1, 'user_answer': 'A', 'time_spent_seconds': 10}]
    _authed(client, auth_headers, 'post', '/api/tutorials/bubble-sort/submit', json=payload)
    _authed(client, auth_headers, 'post', '/api/tutorials/bubble-sort/submit', json=payload)

    with app.app_context():
        events = XpEvent.query.filter_by(
            user_id=1, source_type=XpSourceType.practice_pass
        ).all()
        assert len(events) == 1


def test_submit_practice_perfect_xp_idempotent(client, auth_headers, app):
    """第二次滿分不再重複發放 practice_perfect XP。"""
    from models.xp import XpEvent, XpSourceType
    with app.app_context():
        t = _make_tutorial(_db.session)
        _make_question(_db.session, t.tutorial_id)
        _db.session.commit()

    payload = [{'question_id': 1, 'user_answer': 'A', 'time_spent_seconds': 10}]
    _authed(client, auth_headers, 'post', '/api/tutorials/bubble-sort/submit', json=payload)
    _authed(client, auth_headers, 'post', '/api/tutorials/bubble-sort/submit', json=payload)

    with app.app_context():
        events = XpEvent.query.filter_by(
            user_id=1, source_type=XpSourceType.practice_perfect
        ).all()
        assert len(events) == 1


# ── i18n 語言解析測試 ─────────────────────────────────────────────────────────

def _make_question_bilingual(db_session, tutorial_id, group_id=None):
    """建立同時有 en 和 zh-TW 翻譯的題目。"""
    from models.question import Question, QuestionType, QuestionCategory, QuestionTranslation
    q = Question(
        question_type=QuestionType.single_choice,
        tutorial_id=tutorial_id,
        group_id=group_id,
        category=QuestionCategory.basic,
        correct_answer='A',
        base_rating=1200.0,
        display_order=0,
        is_active=True,
    )
    db_session.add(q)
    db_session.flush()
    for lang, stem in [('en', 'What is bubble sort?'), ('zh-TW', '什麼是氣泡排序？')]:
        from models.question import QuestionTranslation
        qt = QuestionTranslation(
            question_id=q.question_id,
            language_code=lang,
            stem=stem,
            options=[{'key': 'A', 'text': 'A sort'}, {'key': 'B', 'text': 'Not a sort'}],
            explanation='Explanation.' if lang == 'en' else '解釋。',
        )
        db_session.add(qt)
    return q


def test_questions_uses_user_language_when_no_lang_param(client, auth_headers, app):
    """無 ?lang= 時，使用用戶 DB 語言（zh-TW）。"""
    from models.user import User, Language
    with app.app_context():
        t = _make_tutorial(_db.session)
        _make_question_bilingual(_db.session, t.tutorial_id)
        user = _db.session.get(User, 1)
        user.language = Language.zh_TW
        _db.session.commit()

    resp = _authed(client, auth_headers, 'get', '/api/tutorials/bubble-sort/questions')
    assert resp.status_code == 200
    q = resp.get_json()['questions'][0]
    assert q['stem'] == '什麼是氣泡排序？'


def test_questions_lang_param_overrides_user_language(client, auth_headers, app):
    """?lang=en 應覆蓋用戶 DB 語言（zh-TW）。"""
    from models.user import User, Language
    with app.app_context():
        t = _make_tutorial(_db.session)
        _make_question_bilingual(_db.session, t.tutorial_id)
        user = _db.session.get(User, 1)
        user.language = Language.zh_TW
        _db.session.commit()

    resp = _authed(client, auth_headers, 'get',
                   '/api/tutorials/bubble-sort/questions?lang=en')
    assert resp.status_code == 200
    q = resp.get_json()['questions'][0]
    assert q['stem'] == 'What is bubble sort?'


def test_questions_fallback_to_en_when_no_user_language(client, auth_headers, app):
    """user.language 為 None 時，fallback 到 en。"""
    from models.user import User
    with app.app_context():
        t = _make_tutorial(_db.session)
        _make_question_bilingual(_db.session, t.tutorial_id)
        user = _db.session.get(User, 1)
        user.language = None
        _db.session.commit()

    resp = _authed(client, auth_headers, 'get', '/api/tutorials/bubble-sort/questions')
    assert resp.status_code == 200
    q = resp.get_json()['questions'][0]
    assert q['stem'] == 'What is bubble sort?'
