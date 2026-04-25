FROM python:3.11-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install CPU-only PyTorch (override if GPU needed)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir torch-geometric

# Optional: download model from Google Drive
ARG GDRIVE_MODEL_ID=""
COPY scripts/ scripts/
RUN if [ -n "$GDRIVE_MODEL_ID" ]; then \
        pip install gdown && \
        python scripts/download_model.py --id "$GDRIVE_MODEL_ID"; \
    fi

# Copy application
COPY app/ app/
COPY models/ models/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
