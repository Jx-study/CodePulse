from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def init_db(app):
    """Initialize SQLAlchemy and Flask-Migrate with the Flask app."""
    db.init_app(app)
    migrate.init_app(app, db)

def test_connection():
    """Test database connection."""
    try:
        db.session.execute(db.text('SELECT 1'))
        return True
    except Exception:
        return False
