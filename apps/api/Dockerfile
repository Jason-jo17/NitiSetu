# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    libssl-dev \
    libffi-dev \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    curl \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies in a virtualenv to stay isolated
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Download SM SpaCy model (smallest)
RUN python -m spacy download en_core_web_sm

# CRITICAL: Prune site-packages to remove non-runtime files (tests, docs, etc.)
RUN find /opt/venv/lib/python3.11/site-packages -type d -name "tests" -exec rm -rf {} + && \
    find /opt/venv/lib/python3.11/site-packages -type d -name "testing" -exec rm -rf {} + && \
    find /opt/venv/lib/python3.11/site-packages -type d -name "docs" -exec rm -rf {} + && \
    find /opt/venv/lib/python3.11/site-packages -type d -name "examples" -exec rm -rf {} + && \
    find /opt/venv/lib/python3.11/site-packages -name "*.exe" -delete && \
    find /opt/venv/lib/python3.11/site-packages -name "*.pyc" -delete && \
    find /opt/venv/lib/python3.11/site-packages -name "__pycache__" -type d -exec rm -rf {} +

# Stage 2: Runtime
FROM python:3.11-slim

WORKDIR /app

# Install ONLY runtime system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    poppler-utils \
    tesseract-ocr \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy virtualenv from builder
COPY --from=builder /opt/venv /opt/venv

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy application code
COPY . .

EXPOSE 8000

# Start command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
