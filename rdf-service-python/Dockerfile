# Use the official Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install Pipenv
RUN pip install --upgrade pip && pip install --no-cache-dir pipenv

# Copy Pipenv files and install dependencies
COPY Pipfile Pipfile.lock ./
RUN pipenv install --deploy --system

# Install FastAPI with extras
RUN pip install "fastapi[standard]"

# Copy project files
COPY . .

# Expose port (Docker best practice, but Railway uses dynamic ports anyway)
EXPOSE 8000

# ENTRYPOINT: use fastapi CLI, dynamically reading PORT and HOST
CMD ["sh", "-c", "fastapi dev src/main.py --host ${HOST:-0.0.0.0} --port ${PORT:-8000}"]


# to re build the image and container -> docker-compose up --build -d
# to start without re building -> docker compose up
# to shut down -> docker compose down
# to log -> docker-compose logs -f
