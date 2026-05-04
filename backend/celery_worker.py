from celery_app import celery_app  # noqa: F401
import services.analysis_runner  # noqa: F401 — registers Celery task
import services.celery_warmup    # noqa: F401 — connects worker_process_init signal
