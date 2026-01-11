FROM python:3.13-alpine
RUN apk add --no-cache curl
RUN curl -Ls https://astral.sh/uv/install/sh | sh
ENV PATH="/root/.cargo/bin:$PATH"

WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen
COPY . .
ENTRYPOINT ["python"]