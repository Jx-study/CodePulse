import logging
from celery.signals import worker_process_init

logger = logging.getLogger(__name__)


@worker_process_init.connect
def on_worker_process_init(**kwargs):
    import os
    if os.getenv("SKIP_ML_WARMUP") != "1":
        logger.info("Celery worker: starting fastembed warmup...")
        from services.algo_identification import warmup as algo_warmup
        algo_warmup()
        logger.info("Celery worker: warmup complete")
