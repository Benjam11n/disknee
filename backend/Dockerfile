FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV UV_LINK_MODE=copy
ENV PATH="/root/.local/bin:$PATH"

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential curl ffmpeg libgl1 libglib2.0-0 \
  && rm -rf /var/lib/apt/lists/*

RUN curl -LsSf https://astral.sh/uv/install.sh | sh

WORKDIR /app

FROM base AS deps

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

FROM base AS dev-deps

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen

FROM deps AS runner

COPY app ./app
COPY run.py ./run.py

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

FROM dev-deps AS dev

COPY app ./app
COPY tests ./tests
COPY run.py ./run.py

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
