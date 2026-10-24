import os

# Status/stage constants — both implementations use these; analyze.py imports from here
STATUS_PENDING = "pending"
STATUS_RUNNING = "running"
STATUS_COMPLETED = "completed"
STATUS_FAILED = "failed"
STATUS_INPUT_NEEDED = "input_needed"

STAGE_SYNTAX_CHECK = "syntax_check"
STAGE_SANDBOX = "sandbox"
STAGE_ANALYSIS = "analysis"
STAGE_DONE = "done"

# live input 取消哨兵：cancel route 把它 rpush 進 analyze:input 佇列，喚醒 BLPOP 中的
# worker 提前結束（見 analysis_runner._wait_for_user_input）。producer/consumer 共用此值，
# 集中定義避免兩邊不同步。
CANCEL_INPUT_VALUE = "__CODEPULSE_CANCEL__"

_USE_CELERY = os.getenv("USE_CELERY", "0") == "1"

if _USE_CELERY:
    from services.task_queue_celery import task_queue  # noqa: F401
else:
    from services.task_queue_memory import task_queue  # noqa: F401
