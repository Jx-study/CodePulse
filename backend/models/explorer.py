from database import db
from datetime import datetime, timezone
import enum


class AnalysisSource(enum.Enum):
    ast_bigO = 'ast+bigO'
    gemini = 'gemini'


class ExploreHistory(db.Model):
    __tablename__ = 'explore_histories'

    explore_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    user_code = db.Column(db.Text, nullable=False)
    detected_algorithm = db.Column(db.String(100), nullable=True)
    # loose reference to Tutorial.slug, no FK
    confidence_score = db.Column(db.Float, nullable=True)
    time_complexity = db.Column(db.String(50), nullable=True)
    space_complexity = db.Column(db.String(50), nullable=True)
    analysis_source = db.Column(db.Enum(AnalysisSource), nullable=False)
    have_level1 = db.Column(db.Boolean, nullable=False, server_default='false')
    execution_trace = db.Column(db.JSON, nullable=True)
    is_truncated = db.Column(db.Boolean, nullable=False, server_default='false')
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.Index('ix_explore_histories_user_id', 'user_id'),
        db.Index('ix_explore_histories_detected_algorithm', 'detected_algorithm'),
        db.Index('ix_explore_histories_user_created', 'user_id', 'created_at'),
    )

    def __repr__(self):
        return f'<ExploreHistory {self.explore_id} user={self.user_id} algo={self.detected_algorithm}>'
