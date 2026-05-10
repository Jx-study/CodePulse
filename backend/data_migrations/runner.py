#!/usr/bin/env python3
"""
Run pending data migrations in order.
Usage: venv/bin/python data_migrations/runner.py
"""
import os
import sys
import importlib.util
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import create_app, db
import sqlalchemy as sa

MIGRATIONS_DIR = os.path.dirname(os.path.abspath(__file__))

_metadata = sa.MetaData()
HISTORY_TABLE = sa.Table(
    "data_migration_history",
    _metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("filename", sa.String(256), unique=True, nullable=False),
    sa.Column("applied_at", sa.DateTime(timezone=True), nullable=False),
)


def get_applied(conn):
    rows = conn.execute(sa.select(HISTORY_TABLE.c.filename)).fetchall()
    return {r[0] for r in rows}


def mark_applied(conn, filename):
    conn.execute(HISTORY_TABLE.insert().values(
        filename=filename,
        applied_at=datetime.now(timezone.utc),
    ))


def run():
    app = create_app()
    with app.app_context():
        engine = db.engine

        _metadata.create_all(engine, checkfirst=True)
        with engine.begin() as conn:
            applied = get_applied(conn)

        scripts = sorted([
            f for f in os.listdir(MIGRATIONS_DIR)
            if f.endswith(".py") and f[0].isdigit()
        ])

        pending = [s for s in scripts if s not in applied]
        if not pending:
            print("No pending data migrations.")
            return

        for filename in pending:
            print(f"Running {filename}...")
            spec = importlib.util.spec_from_file_location(
                filename, os.path.join(MIGRATIONS_DIR, filename)
            )
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            module.run()

            with engine.begin() as conn:
                mark_applied(conn, filename)
            print(f"  Done: {filename}")

    print("All data migrations complete.")


if __name__ == "__main__":
    run()
