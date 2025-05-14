from fastapi import APIRouter, HTTPException, Depends, Body, Query
from fastapi.responses import FileResponse, StreamingResponse
from typing import List, Dict, Any, Optional, Union
import logging
import json
import os
from pydantic import BaseModel

from app.services.export_service import ExportService
from app.schemas.export import ExportRequest, SlideRequest

router = APIRouter()
export_service = ExportService()
logger = logging.getLogger(__name__)

@router.post("/chart")
async def export_chart(request: ExportRequest):
    """
    Export a chart as PNG or SVG file.
    """
    try:
        # Generate the file
        file_path = await export_service.export_chart(
            fig_json=request.fig_json,
            format=request.format,
            width=request.width,
            height=request.height,
            scale=request.scale,
            filename=request.filename,
        )
        
        # Return the file for download
        return FileResponse(
            path=file_path,
            filename=os.path.basename(file_path),
            media_type=f"image/{request.format}"
        )
    
    except Exception as e:
        logger.error(f"Error exporting chart: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/slide")
async def export_slide(request: SlideRequest):
    """
    Export a PowerPoint slide with a chart.
    """
    try:
        # Generate the PowerPoint file
        pptx_path = await export_service.export_slide(
            fig_json=request.fig_json,
            title=request.title,
            caption=request.caption,
            filename=request.filename,
        )
        
        # Return the file for download
        return FileResponse(
            path=pptx_path,
            filename=os.path.basename(pptx_path),
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
    
    except Exception as e:
        logger.error(f"Error exporting slide: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/data")
async def export_data(file_id: str = Query(...), format: str = Query("csv")):
    """
    Export the dataset or filtered dataset as CSV or Excel.
    """
    try:
        # Generate the export file
        export_path, media_type = await export_service.export_data(
            file_id=file_id,
            format=format,
        )
        
        # Return the file for download
        return FileResponse(
            path=export_path,
            filename=os.path.basename(export_path),
            media_type=media_type
        )
    
    except Exception as e:
        logger.error(f"Error exporting data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
