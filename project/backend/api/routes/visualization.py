from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional

from services.visualization_service import VisualizationService
from schemas.visualization import (
    VisualizationRequest,
    VisualizationResponse,
    VisualizationTypeEnum,
    ExportFormat
)

router = APIRouter()

@router.post("", response_model=VisualizationResponse)
async def create_visualization(
    request: VisualizationRequest,
    visualization_service: VisualizationService = Depends()
):
    """
    Create a new visualization based on analysis results
    """
    try:
        result = await visualization_service.create_visualization(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/types", response_model=List[VisualizationTypeEnum])
async def get_visualization_types():
    """
    Get available visualization types
    """
    return list(VisualizationTypeEnum)

@router.get("/{visualization_id}", response_model=VisualizationResponse)
async def get_visualization(
    visualization_id: str,
    visualization_service: VisualizationService = Depends()
):
    """
    Get visualization by ID
    """
    try:
        result = await visualization_service.get_visualization(visualization_id)
        if not result:
            raise HTTPException(status_code=404, detail="Visualization not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[VisualizationResponse])
async def list_visualizations(
    analysis_id: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    visualization_service: VisualizationService = Depends()
):
    """
    List visualizations with optional filtering
    """
    try:
        result = await visualization_service.list_visualizations(
            analysis_id, limit, offset
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{visualization_id}/export")
async def export_visualization(
    visualization_id: str,
    format: ExportFormat,
    visualization_service: VisualizationService = Depends()
):
    """
    Export visualization to specified format (PNG, SVG, PDF, etc.)
    """
    try:
        result = await visualization_service.export_visualization(visualization_id, format)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{visualization_id}")
async def delete_visualization(
    visualization_id: str,
    visualization_service: VisualizationService = Depends()
):
    """
    Delete a visualization by ID
    """
    try:
        success = await visualization_service.delete_visualization(visualization_id)
        if not success:
            raise HTTPException(status_code=404, detail="Visualization not found")
        return {"message": "Visualization deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))