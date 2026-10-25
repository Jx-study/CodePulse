"""
seed_tutorials.py
=================
將 algorithm_categories 和 tutorials 匯入 DB。
資料來源需要與 frontend/src/data/levels/levels.json 同步維護。

策略：upsert（slug 已存在則更新，否則插入）。
不會刪除已移除的 tutorial，避免外鍵問題。

執行方式（在 backend/ 目錄下）：
    python seeds/seed_tutorials.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from database import db
from models.tutorial import AlgorithmCategory, Tutorial

# 與 frontend/src/data/levels/levels.json categories 同步
CATEGORIES = [
    "data-structures",
    "sorting",
    "searching",
    "recursive",
    "technique",
    "graph",
    "dp",
]

# 與 frontend/src/data/levels/levels.json levels 同步
# 欄位：(slug, category, difficulty)
TUTORIALS = [
    # data-structures
    ("array",               "data-structures", 1),
    ("linked-list",         "data-structures", 1),
    ("stack",               "data-structures", 2),
    ("queue",               "data-structures", 2),
    ("binarytree",          "data-structures", 2),
    ("bst",                 "data-structures", 3),
    ("heap",                "data-structures", 3),
    ("graph",               "data-structures", 2),
    ("trie",                "data-structures", 3),
    ("portal-to-sorting",   "data-structures", 1),
    # sorting
    ("bubble-sort",         "sorting",         1),
    ("selection-sort",      "sorting",         1),
    ("insertion-sort",      "sorting",         1),
    ("merge-sort",          "sorting",         3),
    ("quick-sort",          "sorting",         3),
    ("portal-to-searching", "sorting",         1),
    # searching
    ("linear-search",       "searching",       1),
    ("binary-search",       "searching",       2),
    ("portal-to-recursive", "searching",       1),
    # recursive
    ("factorial",           "recursive",       1),
    ("fibonacci-recursive", "recursive",       2),
    ("merge-sort-recursive","recursive",       3),
    ("hanoi",               "recursive",       3),
    ("quick-sort-recursive","recursive",       3),
    ("n-queens",            "recursive",       4),
    ("portal-to-technique", "recursive",       1),
    # technique
    ("prefix-sum",          "technique",       2),
    ("sliding-window",      "technique",       2),
    ("two-pointers",        "technique",       2),
    ("bit-mask",            "technique",       3),
    ("portal-to-graph",     "technique",       1),
    # graph
    ("bfs",                 "graph",           3),
    ("dfs",                 "graph",           3),
    ("topological-sort",    "graph",           3),
    ("union-find",          "graph",           3),
    ("dijkstra",            "graph",           4),
    ("astar",               "graph",           4),
    ("portal-to-dp",        "graph",           1),
    # dp
    ("dp-fibonacci",        "dp",              2),
    ("knapsack",            "dp",              3),
    ("lcs",                 "dp",              3),
]


def run():
    app = create_app("development")
    with app.app_context():
        print("=== Seeding categories ===")
        _seed_categories()

        print("=== Seeding tutorials ===")
        _seed_tutorials()

        print("=== Done ===")


def _seed_categories():
    for slug in CATEGORIES:
        cat = AlgorithmCategory.query.filter_by(slug=slug).first()
        if not cat:
            db.session.add(AlgorithmCategory(slug=slug))
            print(f"  [INSERT] category '{slug}'")
        else:
            print(f"  [SKIP]   category '{slug}' already exists")
    db.session.commit()


def _seed_tutorials():
    for slug, category_slug, difficulty in TUTORIALS:
        cat = AlgorithmCategory.query.filter_by(slug=category_slug).first()
        if not cat:
            print(f"  [SKIP] Tutorial '{slug}': category '{category_slug}' not found")
            continue

        tutorial = Tutorial.query.filter_by(slug=slug).first()

        if not tutorial:
            db.session.add(Tutorial(
                slug=slug,
                category_id=cat.category_id,
                difficulty=difficulty,
                xp_teaching=10,
                xp_practice_base=20,
                xp_perfect_bonus=10,
            ))
            print(f"  [INSERT] tutorial '{slug}'")
        else:
            tutorial.difficulty = difficulty
            print(f"  [UPDATE] tutorial '{slug}'")

    db.session.commit()


if __name__ == "__main__":
    run()