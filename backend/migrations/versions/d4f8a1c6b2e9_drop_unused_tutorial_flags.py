"""drop unused tutorials.practice_enabled and tutorials.is_published

Revision ID: d4f8a1c6b2e9
Revises: 780175a37a74
Create Date: 2026-10-24 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd4f8a1c6b2e9'
down_revision = '780175a37a74'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('tutorials', schema=None) as batch_op:
        batch_op.drop_index('ix_tutorials_published')
        batch_op.drop_column('is_published')
        batch_op.drop_column('practice_enabled')


def downgrade():
    with op.batch_alter_table('tutorials', schema=None) as batch_op:
        batch_op.add_column(sa.Column('practice_enabled', sa.Boolean(), nullable=True))
        batch_op.add_column(sa.Column('is_published', sa.Boolean(), nullable=True))
        batch_op.create_index('ix_tutorials_published', ['is_published'], unique=False)
