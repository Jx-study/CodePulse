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
    llm_summary = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.Index('ix_explore_histories_user_id', 'user_id'),
        db.Index('ix_explore_histories_detected_algorithm', 'detected_algorithm'),
        db.Index('ix_explore_histories_user_created', 'user_id', 'created_at'),
    )

    def __repr__(self):
        return f'<ExploreHistory {self.explore_id} user={self.user_id} algo={self.detected_algorithm}>'


class AlgoDivergenceLog(db.Model):
    __tablename__ = "algo_divergence_logs"

    id               = db.Column(db.Integer, primary_key=True)
    code_hash        = db.Column(db.String(64), unique=True, nullable=False, index=True)
    code             = db.Column(db.Text, nullable=False)
    detected_algo    = db.Column(db.String(64), nullable=False)
    confidence       = db.Column(db.Float, nullable=False)
    is_recursive     = db.Column(db.Boolean, nullable=False)
    expected_struct  = db.Column(db.String(16), nullable=False)
    divergence_type  = db.Column(db.String(32), nullable=False)
    occurrence_count = db.Column(db.Integer, nullable=False, server_default="1")
    first_seen_at    = db.Column(
        db.DateTime(timezone=True),
        server_default=db.func.now(),
        nullable=False,
    )
    last_seen_at     = db.Column(
        db.DateTime(timezone=True),
        server_default=db.func.now(),
        onupdate=db.func.now(),
        nullable=False,
    )
