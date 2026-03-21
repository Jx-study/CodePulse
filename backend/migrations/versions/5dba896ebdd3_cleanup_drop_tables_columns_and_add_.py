""""cleanup_drop_tables_columns_and_add_enums"

Revision ID: 5dba896ebdd3
Revises: 3fd4bcecf200
Create Date: 2026-03-19 11:18:13.733170

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '5dba896ebdd3'
down_revision = '3fd4bcecf200'
branch_labels = None
depends_on = None


def upgrade():
    # ── 1. Drop legacy tables ──────────────────────────────────────────────────
    with op.batch_alter_table('algorithm_category_translations', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_algo_cat_trans_category_id'))
    op.drop_table('algorithm_category_translations')

    with op.batch_alter_table('tutorial_translations', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_tutorial_translations_tutorial_id'))
    op.drop_table('tutorial_translations')

    with op.batch_alter_table('tutorial_suggestions', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_tutorial_suggestions_tutorial_id'))
    op.drop_table('tutorial_suggestions')

    with op.batch_alter_table('tutorial_prerequisites', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_tutorial_prerequisites_prereq_id'))
        batch_op.drop_index(batch_op.f('ix_tutorial_prerequisites_tutorial_id'))
    op.drop_table('tutorial_prerequisites')

    # ── 2. Drop legacy columns ─────────────────────────────────────────────────
    with op.batch_alter_table('algorithm_categories', schema=None) as batch_op:
        batch_op.drop_column('color_theme')
        batch_op.drop_column('display_order')
        batch_op.drop_column('icon')

    with op.batch_alter_table('practice_attempts', schema=None) as batch_op:
        batch_op.drop_column('analysis_result')

    with op.batch_alter_table('tutorials', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_tutorials_category_graph'))
        batch_op.drop_index(batch_op.f('ix_tutorials_category_order'))
        batch_op.drop_constraint(batch_op.f('tutorials_portal_target_category_id_fkey'), type_='foreignkey')
        batch_op.drop_column('time_complexity')
        batch_op.drop_column('thumbnail_url')
        batch_op.drop_column('implementation_key')
        batch_op.drop_column('show_on_homepage')
        batch_op.drop_column('portal_target_category_id')
        batch_op.drop_column('graph_horizontal_index')
        batch_op.drop_column('graph_branch')
        batch_op.drop_column('prerequisite_type')
        batch_op.drop_column('display_order')
        batch_op.drop_column('graph_layer')
        batch_op.drop_column('space_complexity')
        batch_op.drop_column('homepage_translation_key')
        batch_op.drop_column('homepage_image')
        batch_op.drop_column('branch_label')
        batch_op.drop_column('path_color_theme')
        batch_op.drop_column('path_type')

    # ── 3. Create enum types then alter columns ────────────────────────────────
    conn = op.get_bind()

    # achievementcategory
    conn.execute(sa.text("CREATE TYPE achievementcategory AS ENUM ('learning', 'practice', 'streak', 'milestone')"))
    conn.execute(sa.text("ALTER TABLE achievement_definitions ALTER COLUMN category TYPE achievementcategory USING category::achievementcategory"))

    # achievementconditiontype
    conn.execute(sa.text("CREATE TYPE achievementconditiontype AS ENUM ('tutorials_completed', 'category_completed', 'perfect_score', 'login_streak', 'xp_milestone', 'skill_tier_reached')"))
    conn.execute(sa.text("ALTER TABLE achievement_definitions ALTER COLUMN condition_type TYPE achievementconditiontype USING condition_type::achievementconditiontype"))

    # analysissource
    conn.execute(sa.text("CREATE TYPE analysissource AS ENUM ('ast_bigO', 'gemini')"))
    conn.execute(sa.text("ALTER TABLE explore_histories ALTER COLUMN analysis_source TYPE analysissource USING analysis_source::analysissource"))

    # sessionmode
    conn.execute(sa.text("CREATE TYPE sessionmode AS ENUM ('teaching', 'practice')"))
    conn.execute(sa.text("ALTER TABLE learning_sessions ALTER COLUMN mode TYPE sessionmode USING mode::sessionmode"))

    # questiontype
    conn.execute(sa.text("CREATE TYPE questiontype AS ENUM ('single_choice', 'multiple_choice', 'true_false', 'predict_line', 'fill_code')"))
    conn.execute(sa.text("ALTER TABLE questions ALTER COLUMN question_type TYPE questiontype USING question_type::questiontype"))

    # questioncategory
    conn.execute(sa.text("CREATE TYPE questioncategory AS ENUM ('basic', 'application', 'complexity')"))
    conn.execute(sa.text("ALTER TABLE questions ALTER COLUMN category TYPE questioncategory USING category::questioncategory"))

    # xpsourcetype
    conn.execute(sa.text("CREATE TYPE xpsourcetype AS ENUM ('teaching_complete', 'practice_pass', 'practice_perfect', 'achievement_unlock', 'login_streak')"))
    conn.execute(sa.text("ALTER TABLE xp_events ALTER COLUMN source_type TYPE xpsourcetype USING source_type::xpsourcetype"))


def downgrade():
    conn = op.get_bind()

    # ── Revert enum columns back to varchar, then drop types ──────────────────
    conn.execute(sa.text("ALTER TABLE xp_events ALTER COLUMN source_type TYPE VARCHAR(30) USING source_type::text"))
    conn.execute(sa.text("DROP TYPE IF EXISTS xpsourcetype"))

    conn.execute(sa.text("ALTER TABLE questions ALTER COLUMN question_type TYPE VARCHAR(20) USING question_type::text"))
    conn.execute(sa.text("ALTER TABLE questions ALTER COLUMN category TYPE VARCHAR(20) USING category::text"))
    conn.execute(sa.text("DROP TYPE IF EXISTS questiontype"))
    conn.execute(sa.text("DROP TYPE IF EXISTS questioncategory"))

    conn.execute(sa.text("ALTER TABLE learning_sessions ALTER COLUMN mode TYPE VARCHAR(20) USING mode::text"))
    conn.execute(sa.text("DROP TYPE IF EXISTS sessionmode"))

    conn.execute(sa.text("ALTER TABLE explore_histories ALTER COLUMN analysis_source TYPE VARCHAR(20) USING analysis_source::text"))
    conn.execute(sa.text("DROP TYPE IF EXISTS analysissource"))

    conn.execute(sa.text("ALTER TABLE achievement_definitions ALTER COLUMN category TYPE VARCHAR(50) USING category::text"))
    conn.execute(sa.text("ALTER TABLE achievement_definitions ALTER COLUMN condition_type TYPE VARCHAR(50) USING condition_type::text"))
    conn.execute(sa.text("DROP TYPE IF EXISTS achievementcategory"))
    conn.execute(sa.text("DROP TYPE IF EXISTS achievementconditiontype"))

    with op.batch_alter_table('tutorials', schema=None) as batch_op:
        batch_op.add_column(sa.Column('path_type', sa.VARCHAR(length=20), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('path_color_theme', sa.VARCHAR(length=20), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('branch_label', sa.VARCHAR(length=50), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('homepage_image', sa.VARCHAR(length=200), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('homepage_translation_key', sa.VARCHAR(length=100), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('space_complexity', sa.VARCHAR(length=50), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('graph_layer', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('display_order', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('prerequisite_type', sa.VARCHAR(length=10), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('graph_branch', sa.VARCHAR(length=50), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('graph_horizontal_index', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('portal_target_category_id', sa.BIGINT(), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('show_on_homepage', sa.BOOLEAN(), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('implementation_key', sa.VARCHAR(length=100), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('thumbnail_url', sa.VARCHAR(length=500), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('time_complexity', sa.VARCHAR(length=50), autoincrement=False, nullable=True))
        batch_op.create_foreign_key(batch_op.f('tutorials_portal_target_category_id_fkey'), 'algorithm_categories', ['portal_target_category_id'], ['category_id'], ondelete='SET NULL')
        batch_op.create_index(batch_op.f('ix_tutorials_category_order'), ['category_id', 'display_order'], unique=False)
        batch_op.create_index(batch_op.f('ix_tutorials_category_graph'), ['category_id', 'graph_layer', 'graph_branch'], unique=False)

    with op.batch_alter_table('practice_attempts', schema=None) as batch_op:
        batch_op.add_column(sa.Column('analysis_result', postgresql.JSON(astext_type=sa.Text()), autoincrement=False, nullable=True))

    with op.batch_alter_table('algorithm_categories', schema=None) as batch_op:
        batch_op.add_column(sa.Column('icon', sa.VARCHAR(length=50), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('display_order', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('color_theme', sa.VARCHAR(length=20), autoincrement=False, nullable=True))

    op.create_table('tutorial_prerequisites',
    sa.Column('id', sa.BIGINT(), autoincrement=True, nullable=False),
    sa.Column('tutorial_id', sa.BIGINT(), autoincrement=False, nullable=False),
    sa.Column('prerequisite_id', sa.BIGINT(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['prerequisite_id'], ['tutorials.tutorial_id'], name=op.f('tutorial_prerequisites_prerequisite_id_fkey'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['tutorial_id'], ['tutorials.tutorial_id'], name=op.f('tutorial_prerequisites_tutorial_id_fkey'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('tutorial_prerequisites_pkey')),
    sa.UniqueConstraint('tutorial_id', 'prerequisite_id', name=op.f('uq_tutorial_prerequisite'), postgresql_include=[], postgresql_nulls_not_distinct=False)
    )
    with op.batch_alter_table('tutorial_prerequisites', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_tutorial_prerequisites_tutorial_id'), ['tutorial_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_tutorial_prerequisites_prereq_id'), ['prerequisite_id'], unique=False)

    op.create_table('tutorial_suggestions',
    sa.Column('id', sa.BIGINT(), autoincrement=True, nullable=False),
    sa.Column('tutorial_id', sa.BIGINT(), autoincrement=False, nullable=False),
    sa.Column('suggested_id', sa.BIGINT(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['suggested_id'], ['tutorials.tutorial_id'], name=op.f('tutorial_suggestions_suggested_id_fkey'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['tutorial_id'], ['tutorials.tutorial_id'], name=op.f('tutorial_suggestions_tutorial_id_fkey'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('tutorial_suggestions_pkey')),
    sa.UniqueConstraint('tutorial_id', 'suggested_id', name=op.f('uq_tutorial_suggestion'), postgresql_include=[], postgresql_nulls_not_distinct=False)
    )
    with op.batch_alter_table('tutorial_suggestions', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_tutorial_suggestions_tutorial_id'), ['tutorial_id'], unique=False)

    op.create_table('tutorial_translations',
    sa.Column('id', sa.BIGINT(), autoincrement=True, nullable=False),
    sa.Column('tutorial_id', sa.BIGINT(), autoincrement=False, nullable=False),
    sa.Column('language_code', sa.VARCHAR(length=10), autoincrement=False, nullable=False),
    sa.Column('title', sa.VARCHAR(length=200), autoincrement=False, nullable=False),
    sa.Column('description', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('learning_objectives', postgresql.JSON(astext_type=sa.Text()), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['tutorial_id'], ['tutorials.tutorial_id'], name=op.f('tutorial_translations_tutorial_id_fkey'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('tutorial_translations_pkey')),
    sa.UniqueConstraint('tutorial_id', 'language_code', name=op.f('uq_tutorial_translation'), postgresql_include=[], postgresql_nulls_not_distinct=False)
    )
    with op.batch_alter_table('tutorial_translations', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_tutorial_translations_tutorial_id'), ['tutorial_id'], unique=False)

    op.create_table('algorithm_category_translations',
    sa.Column('id', sa.BIGINT(), autoincrement=True, nullable=False),
    sa.Column('category_id', sa.BIGINT(), autoincrement=False, nullable=False),
    sa.Column('language_code', sa.VARCHAR(length=10), autoincrement=False, nullable=False),
    sa.Column('name', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('description', sa.TEXT(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['category_id'], ['algorithm_categories.category_id'], name=op.f('algorithm_category_translations_category_id_fkey'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('algorithm_category_translations_pkey')),
    sa.UniqueConstraint('category_id', 'language_code', name=op.f('uq_category_translation'), postgresql_include=[], postgresql_nulls_not_distinct=False)
    )
    with op.batch_alter_table('algorithm_category_translations', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_algo_cat_trans_category_id'), ['category_id'], unique=False)

    # ### end Alembic commands ###
