FROM nvidia/cuda:12.2.0-runtime-ubuntu22.04

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip3 install --no-cache-dir \
    llama-cpp-python[server] \
    torch \
    transformers \
    fastapi \
    uvicorn \
    pydantic

# Create models directory
RUN mkdir -p /models

# Copy server code
COPY llm_server.py .

# Expose port
EXPOSE 8080

# Command to run the server
CMD ["python3", "llm_server.py"]