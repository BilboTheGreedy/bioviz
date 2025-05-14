from enum import Enum
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime


class ModelTypeEnum(str, Enum):
    GENERAL = "general"
    BIOMEDICAL = "biomedical"
    GENOMICS = "genomics"
    PROTEIN = "protein"
    DOMAIN_SPECIFIC = "domain_specific"


class AvailableModel(BaseModel):
    """Information about an available LLM model"""
    id: str
    name: str
    type: ModelTypeEnum
    description: str
    context_window: int
    parameters: Optional[str] = None
    version: Optional[str] = None
    local: bool = True


class LLMRequest(BaseModel):
    """Request for LLM query"""
    model_id: str
    query: str
    file_id: Optional[str] = None
    analysis_id: Optional[str] = None
    visualization_id: Optional[str] = None
    include_context: bool = True
    system_prompt: Optional[str] = None
    temperature: float = 0.7
    max_tokens: Optional[int] = None


class Citation(BaseModel):
    """Citation for LLM response"""
    text: str
    url: Optional[str] = None
    title: Optional[str] = None
    authors: Optional[List[str]] = None
    year: Optional[int] = None


class LLMResponse(BaseModel):
    """Response from LLM query"""
    id: str = Field(..., description="Unique query identifier")
    model_id: str
    query: str
    response: str
    citations: Optional[List[Citation]] = None
    confidence: Optional[float] = None
    usage: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime