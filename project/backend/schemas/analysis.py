from enum import Enum
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime


class AnalysisTypeEnum(str, Enum):
    SEQUENCE_ALIGNMENT = "sequence_alignment"
    CLUSTERING = "clustering"
    DIMENSIONALITY_REDUCTION = "dimensionality_reduction"
    DIFFERENTIAL_EXPRESSION = "differential_expression"
    PHYLOGENETIC_ANALYSIS = "phylogenetic_analysis"
    VARIANT_CALLING = "variant_calling"
    FUNCTIONAL_ENRICHMENT = "functional_enrichment"
    PATHWAY_ANALYSIS = "pathway_analysis"
    NETWORK_ANALYSIS = "network_analysis"
    CUSTOM = "custom"


class AnalysisStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class AnalysisParameters(BaseModel):
    """Parameters for the analysis"""
    algorithm: Optional[str] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)


class AnalysisRequest(BaseModel):
    """Request to create a new analysis"""
    file_id: str
    analysis_type: AnalysisTypeEnum
    parameters: AnalysisParameters
    description: Optional[str] = None


class AnalysisResult(BaseModel):
    """Results of the analysis"""
    summary: Dict[str, Any]
    raw_data: Optional[Dict[str, Any]] = None
    plots: List[Dict[str, Any]] = Field(default_factory=list)


class AnalysisResponse(BaseModel):
    """Response model for analysis operations"""
    id: str = Field(..., description="Unique analysis identifier")
    file_id: str
    analysis_type: AnalysisTypeEnum
    parameters: AnalysisParameters
    status: AnalysisStatus
    description: Optional[str] = None
    result: Optional[AnalysisResult] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime