FROM python:3.11-slim

WORKDIR /app

# Install system dependencies 
RUN apt-get update && apt-get install -y \
    build-essential \
    libopenblas-dev \
    git \
    wget \
    cmake \
    pkg-config \
    ninja-build \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for llama-cpp-python
ENV CMAKE_ARGS="-DLLAMA_BLAS=ON -DLLAMA_BLAS_VENDOR=OpenBLAS"
ENV FORCE_CMAKE=1

# Copy and install requirements in stages for better caching
COPY requirements.txt .

# Install packages except llama-cpp-python first
RUN grep -v "llama-cpp-python" requirements.txt > base_requirements.txt && \
    pip install --no-cache-dir -r base_requirements.txt

# Now install llama-cpp-python with the pre-built wheel
RUN pip install --no-cache-dir --find-links=https://jllllll.github.io/llama-cpp-python-cuBLAS-wheels/cpu/ llama-cpp-python==0.3.9

# Copy application code
COPY . .

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]