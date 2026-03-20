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
    from models.tutorial import UserTutorialProgress, TutorialStatus
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
            status=TutorialStatus.teaching_done,
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
    assert items[0]['status'] == 'teaching_done'
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
