FROM ubuntu:20.04 as base

# Install necessary packages
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Download and install Ollama
RUN curl -L https://ollama.ai/download/ollama-linux-amd64 -o /usr/local/bin/ollama \
    && chmod +x /usr/local/bin/ollama

# Create ollama user and directory structure
RUN mkdir -p /root/.ollama

# Set working directory
WORKDIR /root

# Expose API port
EXPOSE 8080

# Command to run Ollama
CMD ["/usr/local/bin/ollama", "serve"]