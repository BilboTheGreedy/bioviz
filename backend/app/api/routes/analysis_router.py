from fastapi import APIRouter, HTTPException, Depends, Query, Body
from typing import List, Dict, Any, Optional, Union
import logging
import json
from pydantic import BaseModel

from app.services.analysis_service import AnalysisService
from app.services.file_service import FileService
from app.schemas.analysis import (
    AnalysisRequest, 
    AnalysisResponse, 
    AnalysisMethod,
    AvailableAnalyses
)

router = APIRouter()
analysis_service = AnalysisService()
file_service = FileService()
logger = logging.getLogger(__name__)

@router.get("/methods", response_model=AvailableAnalyses)
async def get_available_methods():
    """
    Get all available analysis methods and their configurations.
    """
    try:
        return await analysis_service.get_available_methods()
    except Exception as e:
        logger.error(f"Error getting analysis methods: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/run", response_model=AnalysisResponse)
async def run_analysis(request: AnalysisRequest):
    """
    Run an analysis on a dataset with specified parameters.
    """
    try:
        # Verify the file exists
        file_path = file_service.get_file_path_from_id(request.file_id)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Run the analysis
        result = await analysis_service.run_analysis(
            file_path=file_path,
            method=request.method,
            params=request.params,
        )
        
        return result
    
    except ValueError as e:
        # Handle validation errors
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except NotImplementedError as e:
        # Handle method not implemented
        logger.error(f"Method not implemented: {str(e)}")
        raise HTTPException(status_code=501, detail=str(e))
    
    except Exception as e:
        # Handle other errors
        logger.error(f"Error running analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metadata/{method}", response_model=Dict[str, Any])
async def get_method_metadata(method: AnalysisMethod):
    """
    Get detailed metadata for a specific analysis method.
    """
    try:
        return await analysis_service.get_method_metadata(method)
    except Exception as e:
        logger.error(f"Error getting metadata for {method}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
