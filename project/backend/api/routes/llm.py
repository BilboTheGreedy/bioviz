from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Optional

from services.llm_service import LLMService
from schemas.llm import (
    LLMRequest,
    LLMResponse,
    ModelTypeEnum,
    AvailableModel
)

router = APIRouter()

@router.post("/query", response_model=LLMResponse)
async def query_llm(
    request: LLMRequest,
    llm_service: LLMService = Depends()
):
    """
    Send a query to the LLM about bioinformatics data
    """
    try:
        result = await llm_service.process_query(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/models", response_model=List[AvailableModel])
async def get_available_models(
    llm_service: LLMService = Depends()
):
    """
    Get a list of available LLM models
    """
    try:
        models = await llm_service.get_available_models()
        return models
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/explain/{analysis_id}", response_model=LLMResponse)
async def explain_analysis(
    analysis_id: str,
    query: Optional[str] = Body(None),
    llm_service: LLMService = Depends()
):
    """
    Get an LLM explanation of a specific analysis
    """
    try:
        result = await llm_service.explain_analysis(analysis_id, query)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/suggest", response_model=List[str])
async def suggest_analyses(
    file_id: str = Body(...),
    llm_service: LLMService = Depends()
):
    """
    Get LLM suggestions for analyses based on file content
    """
    try:
        suggestions = await llm_service.suggest_analyses(file_id)
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))