import os
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, field_validator
from pydantic_settings import BaseSettings

class LLMSettings(BaseModel):
    model_path: str
    model_type: str
    server_url: Optional[str] = None
    context_window: int = 8192
    max_tokens: int = 4096
    temperature: float = 0.7
    top_p: float = 0.95
    
    @field_validator('model_type')
    @classmethod
    def validate_model_type(cls, v):
        allowed_types = ['llama', 'ollama', 'huggingface']
        if v not in allowed_types:
            raise ValueError(f"Model type must be one of {allowed_types}")
        return v

class Settings(BaseSettings):
    # API settings
    api_v1_prefix: str = "/api"
    debug: bool = os.getenv("ENV", "production") == "development"
    
    # File upload settings
    upload_dir: str = "/data/uploads"
    max_upload_size: int = 200 * 1024 * 1024  # 200 MB default
    allowed_extensions: List[str] = [".csv", ".xlsx"]
    
    # LLM settings
    llm: LLMSettings = LLMSettings(
        model_path=os.getenv("LLM_MODEL_PATH", "/models/model.gguf"),
        model_type=os.getenv("LLM_MODEL_TYPE", "llama"),
        server_url=os.getenv("LLM_SERVER_URL", "http://llm:8080"),
    )
    
    # Sandbox settings
    sandbox_timeout: int = 30  # seconds
    max_memory: int = 4 * 1024 * 1024 * 1024  # 4 GB
    
    # Cache settings
    cache_dir: str = "/data/cache"
    embedding_cache_ttl: int = 60 * 60 * 24  # 24 hours
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

# Create settings instance
settings = Settings()

# Ensure directories exist
os.makedirs(settings.upload_dir, exist_ok=True)
os.makedirs(settings.cache_dir, exist_ok=True)
