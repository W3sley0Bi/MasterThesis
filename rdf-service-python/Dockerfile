# Use the official Python 3.11 slim image (Python 3.11 has built-in ExceptionGroup support)
FROM python:3.11-slim

# Set the working directory to the container's root.
WORKDIR /

# (Optional) Install system build dependencies (needed by some packages).
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install Pipenv globally.
RUN pip install --upgrade pip && pip install --no-cache-dir pipenv

# Copy Pipfile and Pipfile.lock from the project root into the container.
COPY Pipfile Pipfile.lock ./

# Install dependencies from Pipfile.lock system-wide using Pipenv.
RUN pipenv install --deploy --system

# Explicitly install FastAPI with its "standard" extras (this ensures the CLI is available)
RUN pip install "fastapi[standard]"

# (Optional) Install any other missing dependencies (e.g. if you need "isodate" or others)
# RUN pip install isodate

# Copy the entire project (including the src folder) into the container.
COPY . .

# Expose port 8000 (the port FastAPI will run on).
EXPOSE 8000

# Use the FastAPI CLI command to run your app (mimicking your local "fastapi dev src/main.py" command).
CMD ["fastapi", "dev", "src/main.py", "--host", "0.0.0.0", "--port", "8000"]


# to re build the image and container -> docker-compose up --build -d
# to start without re building -> docker compose up
# to shut down -> docker compose down
# to log -> docker-compose logs -f
