from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
from enum import Enum

class AnalysisMethod(str, Enum):
    DESCRIPTIVE = "descriptive"
    DIAGNOSTIC = "diagnostic"
    PREDICTIVE = "predictive"
    PRESCRIPTIVE = "prescriptive"
    TIME_SERIES = "time_series"
    REGRESSION = "regression"
    CLUSTER = "cluster"
    FACTOR = "factor"
    COHORT = "cohort"
    MONTE_CARLO = "monte_carlo"
    TEXT_ANALYSIS = "text_analysis"
    QUALITATIVE = "qualitative"

class MethodConfig(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any]
    required_columns: Optional[List[str]] = None
    supports_categorical: bool = True
    supports_numerical: bool = True
    default_visualizations: List[str] = Field(default_factory=list)

class AvailableAnalyses(BaseModel):
    methods: Dict[str, MethodConfig]

class AnalysisRequest(BaseModel):
    file_id: str
    method: AnalysisMethod
    params: Dict[str, Any] = Field(default_factory=dict)
    target_columns: Optional[List[str]] = None
    filter_conditions: Optional[Dict[str, Any]] = None

class VisualizationData(BaseModel):
    type: str
    data: Dict[str, Any]
    layout: Dict[str, Any]
    config: Optional[Dict[str, Any]] = None

class AnalysisResult(BaseModel):
    summary: Dict[str, Any]
    visualizations: List[VisualizationData] = Field(default_factory=list)
    tables: Optional[List[Dict[str, Any]]] = None
    metadata: Optional[Dict[str, Any]] = None

class AnalysisResponse(BaseModel):
    request: AnalysisRequest
    result: AnalysisResult
    execution_time: float
