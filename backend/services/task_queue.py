import os

# Status/stage constants — both implementations use these; analyze.py imports from here
STATUS_PENDING = "pending"
STATUS_RUNNING = "running"
STATUS_COMPLETED = "completed"
STATUS_FAILED = "failed"

STAGE_SYNTAX_CHECK = "syntax_check"
STAGE_SANDBOX = "sandbox"
STAGE_ANALYSIS = "analysis"
STAGE_GEMINI = "gemini"
STAGE_DONE = "done"

_USE_CELERY = os.getenv("USE_CELERY", "0") == "1"

if _USE_CELERY:
    from services.task_queue_celery import task_queue  # noqa: F401
else:
    from services.task_queue_memory import task_queue  # noqa: F401
