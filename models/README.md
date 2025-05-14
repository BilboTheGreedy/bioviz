# LLM Models Directory

This directory is where you should place your local LLM models in GGUF format for use with the application.

## Recommended Models

For optimal performance with bioinformatics data analysis, we recommend using models that are at least 7B parameters in size. The following models have been tested and work well:

1. **LLaMA 3 8B**: [llama-3-8b-instruct.Q5_K_M.gguf](https://huggingface.co/TheBloke/llama-3-8b-instruct-GGUF)
2. **Mistral 7B Instruct**: [mistral-7b-instruct-v0.2.Q5_K_M.gguf](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF)
3. **Nous Hermes 2 Yi 34B**: [Nous-Hermes-2-Yi-34B.Q5_K_M.gguf](https://huggingface.co/TheBloke/Nous-Hermes-2-Yi-34B-GGUF)

## Model Setup

1. Download your preferred model in GGUF format from Hugging Face or other sources
2. Place the model file in this directory
3. Update the `LLM_MODEL_PATH` in your `.env` file or `docker-compose.yml` to point to the model
4. Restart the application

## Environment Configuration

In your `docker-compose.yml` file, make sure the following environment variables are set correctly:

```yaml
environment:
  - LLM_MODEL_PATH=/models/your-model-file.gguf
  - LLM_MODEL_TYPE=llama  # or ollama or huggingface
```

## Hardware Requirements

For optimal performance:
- At least 16GB of RAM for 7B models
- At least 32GB of RAM for larger models
- GPU acceleration is recommended but not required

Note that the first query might be slow as the model is loaded into memory.