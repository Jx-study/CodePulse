"""Shared pytest fixtures for backend tests."""
import pytest

from app import create_app
from database import db as _db


@pytest.fixture
def app():
    """Create app with in-memory SQLite for testing."""
    app = create_app('testing')
    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers(app):
    """Create a test user and return auth cookie headers."""
    from models.user import User, UserRole
    from auth_utils import create_access_token

    with app.app_context():
        user = User(
            user_id=1,
            username='testuser',
            display_name='Test User',
            email='test@example.com',
            role=UserRole.user,
        )
        _db.session.add(user)
        _db.session.commit()
        user_id = user.user_id

    token = create_access_token(user_id)
    # Return as environ_base dict for use with client.open(..., environ_base=auth_headers)
    # Also expose as plain token for flexibility
    return {'access_token': token}
