from enum import Enum
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime


class VisualizationTypeEnum(str, Enum):
    HEATMAP = "heatmap"
    SCATTER_PLOT = "scatter_plot"
    LINE_CHART = "line_chart"
    BAR_CHART = "bar_chart"
    BOX_PLOT = "box_plot"
    VIOLIN_PLOT = "violin_plot"
    NETWORK_GRAPH = "network_graph"
    GENOME_BROWSER = "genome_browser"
    PHYLOGENETIC_TREE = "phylogenetic_tree"
    VOLCANO_PLOT = "volcano_plot"
    PCA_PLOT = "pca_plot"
    TSNE_PLOT = "tsne_plot"
    UMAP_PLOT = "umap_plot"
    CUSTOM = "custom"


class ExportFormat(str, Enum):
    PNG = "png"
    SVG = "svg"
    PDF = "pdf"
    HTML = "html"
    CSV = "csv"
    JSON = "json"


class VisualizationConfig(BaseModel):
    """Configuration for visualization"""
    type: VisualizationTypeEnum
    title: Optional[str] = None
    subtitle: Optional[str] = None
    x_axis: Optional[str] = None
    y_axis: Optional[str] = None
    color_by: Optional[str] = None
    size_by: Optional[str] = None
    filters: Dict[str, Any] = Field(default_factory=dict)
    settings: Dict[str, Any] = Field(default_factory=dict)


class VisualizationRequest(BaseModel):
    """Request to create a new visualization"""
    analysis_id: str
    config: VisualizationConfig
    description: Optional[str] = None


class VisualizationData(BaseModel):
    """Visualization data"""
    url: str
    thumbnail_url: Optional[str] = None
    raw_data: Optional[Dict[str, Any]] = None
    interactive_config: Optional[Dict[str, Any]] = None


class VisualizationResponse(BaseModel):
    """Response model for visualization operations"""
    id: str = Field(..., description="Unique visualization identifier")
    analysis_id: str
    config: VisualizationConfig
    data: VisualizationData
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime