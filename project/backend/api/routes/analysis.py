from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional

from services.analysis_service import AnalysisService
from schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    AnalysisTypeEnum,
    AnalysisStatus
)

router = APIRouter()

@router.post("", response_model=AnalysisResponse)
async def create_analysis(
    request: AnalysisRequest,
    analysis_service: AnalysisService = Depends(),
):
    """
    Create a new analysis job based on uploaded file(s)
    """
    try:
        result = await analysis_service.create_analysis(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/types", response_model=List[AnalysisTypeEnum])
async def get_analysis_types():
    """
    Get available analysis types
    """
    return list(AnalysisTypeEnum)

@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str,
    analysis_service: AnalysisService = Depends(),
):
    """
    Get analysis results by ID
    """
    try:
        result = await analysis_service.get_analysis(analysis_id)
        if not result:
            raise HTTPException(status_code=404, detail="Analysis not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[AnalysisResponse])
async def list_analyses(
    file_id: Optional[str] = Query(None),
    status: Optional[AnalysisStatus] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    analysis_service: AnalysisService = Depends(),
):
    """
    List analyses with optional filtering
    """
    try:
        result = await analysis_service.list_analyses(file_id, status, limit, offset)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    analysis_service: AnalysisService = Depends(),
):
    """
    Delete an analysis by ID
    """
    try:
        success = await analysis_service.delete_analysis(analysis_id)
        if not success:
            raise HTTPException(status_code=404, detail="Analysis not found")
        return {"message": "Analysis deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))