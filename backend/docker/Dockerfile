FROM python:3.11-slim

WORKDIR /sandbox

COPY services/tracer.py .
COPY services/cfg_builder.py .
COPY docker/runner.py .

ENV SANDBOX_CONTAINER=1

USER nobody

CMD ["tail", "-f", "/dev/null"]
