from database import db
from datetime import datetime, timezone


class LearningSession(db.Model):
    __tablename__ = 'learning_sessions'

    session_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    tutorial_id = db.Column(db.BigInteger, db.ForeignKey('tutorials.tutorial_id', ondelete='CASCADE'), nullable=False)
    mode = db.Column(db.String(20), nullable=False)  # 'teaching' | 'practice'
    started_at = db.Column(db.DateTime(timezone=True), nullable=False)
    ended_at = db.Column(db.DateTime(timezone=True), nullable=True)
    duration_seconds = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.Index('ix_learning_sessions_user_tutorial', 'user_id', 'tutorial_id'),
        db.Index('ix_learning_sessions_user_id', 'user_id'),
        db.Index('ix_learning_sessions_started_at', 'started_at'),
    )

    def __repr__(self):
        return f'<LearningSession {self.session_id} user={self.user_id} mode={self.mode}>'


class PracticeAttempt(db.Model):
    __tablename__ = 'practice_attempts'

    attempt_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    tutorial_id = db.Column(db.BigInteger, db.ForeignKey('tutorials.tutorial_id', ondelete='CASCADE'), nullable=False)
    score = db.Column(db.Integer, nullable=False)  # 0-100
    correct_count = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    time_spent_seconds = db.Column(db.Integer, nullable=True)

    user_rating_before = db.Column(db.Float, nullable=False)
    user_rating_after = db.Column(db.Float, nullable=False)
    rating_delta = db.Column(db.Float, nullable=False)

    analysis_result = db.Column(db.JSON, nullable=True)
    # structure: {"overallComment": "...", "weaknessTags": [...], "behaviorTags": [...], "suggestions": [...]}

    submitted_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    answers = db.relationship('AttemptAnswer', backref='attempt', cascade='all, delete-orphan')

    __table_args__ = (
        db.Index('ix_practice_attempts_user_tutorial', 'user_id', 'tutorial_id'),
        db.Index('ix_practice_attempts_user_id', 'user_id'),
        db.Index('ix_practice_attempts_submitted_at', 'submitted_at'),
    )

    def __repr__(self):
        return f'<PracticeAttempt {self.attempt_id} user={self.user_id} score={self.score}>'


class AttemptAnswer(db.Model):
    __tablename__ = 'attempt_answers'

    answer_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    attempt_id = db.Column(db.BigInteger, db.ForeignKey('practice_attempts.attempt_id', ondelete='CASCADE'), nullable=False)
    question_id = db.Column(db.BigInteger, db.ForeignKey('questions.question_id', ondelete='RESTRICT'), nullable=False)
    user_answer = db.Column(db.String(500), nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)
    time_spent_seconds = db.Column(db.Integer, nullable=True)
    question_difficulty_rating = db.Column(db.Float, nullable=False)
    # snapshot of Question.difficulty_rating at time of answer
    answered_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint('attempt_id', 'question_id', name='uq_attempt_question'),
        db.Index('ix_attempt_answers_attempt_id', 'attempt_id'),
    )

    def __repr__(self):
        return f'<AttemptAnswer attempt={self.attempt_id} question={self.question_id} correct={self.is_correct}>'
