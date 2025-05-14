from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
import os
import pandas as pd
import numpy as np
import uuid
import logging
from datetime import datetime

from app.core.config import settings
from app.services.file_service import FileService
from app.schemas.file import FileInfo, SchemaInfo, DatasetPreview

router = APIRouter()
file_service = FileService()
logger = logging.getLogger(__name__)

@router.post("/upload", response_model=FileInfo)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a CSV or XLSX file and get basic information about it.
    """
    # Check file extension
    _, ext = os.path.splitext(file.filename)
    if ext.lower() not in settings.allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Supported formats: {', '.join(settings.allowed_extensions)}"
        )
    
    try:
        # Save the file with a unique ID
        file_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{file_id}_{timestamp}{ext}"
        file_path = os.path.join(settings.upload_dir, safe_filename)
        
        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Save the uploaded file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
            
            # Check file size
            if len(content) > settings.max_upload_size:
                # Remove the file if it's too large
                os.remove(file_path)
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Maximum size: {settings.max_upload_size / (1024 * 1024):.1f} MB"
                )
        
        # Get file info and preview
        file_info = await file_service.get_file_info(file_path, original_filename=file.filename)
        
        return file_info
    
    except Exception as e:
        logger.error(f"Error processing uploaded file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/schema/{file_id}", response_model=SchemaInfo)
async def get_schema(file_id: str):
    """
    Get detailed schema information for a previously uploaded file.
    """
    try:
        # Find the file path from ID
        file_path = file_service.get_file_path_from_id(file_id)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Get schema information
        schema_info = await file_service.get_schema_info(file_path)
        return schema_info
    
    except Exception as e:
        logger.error(f"Error getting schema for {file_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/preview/{file_id}", response_model=DatasetPreview)
async def get_preview(
    file_id: str,
    start: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
):
    """
    Get a preview of the dataset with pagination.
    """
    try:
        # Find the file path from ID
        file_path = file_service.get_file_path_from_id(file_id)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Get data preview
        preview = await file_service.get_data_preview(file_path, start, limit)
        return preview
    
    except Exception as e:
        logger.error(f"Error getting preview for {file_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=List[FileInfo])
async def list_files():
    """
    List all uploaded files.
    """
    try:
        files = await file_service.list_files()
        return files
    
    except Exception as e:
        logger.error(f"Error listing files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{file_id}")
async def delete_file(file_id: str):
    """
    Delete a file by ID.
    """
    try:
        success = await file_service.delete_file(file_id)
        if not success:
            raise HTTPException(status_code=404, detail="File not found")
        
        return {"message": "File deleted successfully"}
    
    except Exception as e:
        logger.error(f"Error deleting file {file_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
