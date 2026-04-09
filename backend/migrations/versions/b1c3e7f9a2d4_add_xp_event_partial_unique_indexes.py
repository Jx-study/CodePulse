""""add_xp_event_partial_unique_indexes"

Revision ID: b1c3e7f9a2d4
Revises: aaaf99fb8bae
Create Date: 2026-04-03 00:00:00.000000

Adds partial unique indexes on xp_events to prevent duplicate XP grants
for the same (user, source) pair per event type.
"""
from alembic import op


revision = 'b1c3e7f9a2d4'
down_revision = 'aaaf99fb8bae'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        CREATE UNIQUE INDEX ux_xp_teaching
        ON xp_events (user_id, source_id)
        WHERE source_type = 'teaching_complete'
    """)
    op.execute("""
        CREATE UNIQUE INDEX ux_xp_practice_pass
        ON xp_events (user_id, source_id)
        WHERE source_type = 'practice_pass'
    """)
    op.execute("""
        CREATE UNIQUE INDEX ux_xp_practice_perfect
        ON xp_events (user_id, source_id)
        WHERE source_type = 'practice_perfect'
    """)
    op.execute("""
        CREATE UNIQUE INDEX ux_xp_achievement
        ON xp_events (user_id, source_id)
        WHERE source_type = 'achievement_unlock'
    """)


def downgrade():
    op.execute("DROP INDEX IF EXISTS ux_xp_teaching")
    op.execute("DROP INDEX IF EXISTS ux_xp_practice_pass")
    op.execute("DROP INDEX IF EXISTS ux_xp_practice_perfect")
    op.execute("DROP INDEX IF EXISTS ux_xp_achievement")
