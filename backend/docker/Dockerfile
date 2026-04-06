FROM python:3.11-slim

WORKDIR /sandbox

COPY services/tracer.py .
COPY services/cfg_builder.py .
COPY docker/runner.py .

USER nobody

ENTRYPOINT ["python", "runner.py"]
