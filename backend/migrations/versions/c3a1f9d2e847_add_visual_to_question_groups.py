""""add_visual_to_question_groups"

Revision ID: c3a1f9d2e847
Revises: 17e147eb2a57
Create Date: 2026-05-16 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c3a1f9d2e847'
down_revision = '17e147eb2a57'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('question_groups',
        sa.Column('visual_type', sa.String(20), nullable=False, server_default='none'))
    op.add_column('question_groups',
        sa.Column('visual_data', sa.JSON(), nullable=True))
    op.add_column('question_group_translations',
        sa.Column('visual_alt', sa.Text(), nullable=True))


def downgrade():
    op.drop_column('question_group_translations', 'visual_alt')
    op.drop_column('question_groups', 'visual_data')
    op.drop_column('question_groups', 'visual_type')
