from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from typing import List

from services.file_service import FileService
from schemas.file import FileResponse, FileTypeEnum

router = APIRouter()

@router.post("/upload", response_model=FileResponse)
async def upload_file(
    file: UploadFile = File(...),
    file_service: FileService = Depends(),
):
    """
    Upload a bioinformatics data file (FASTA, CSV, TSV, etc.)
    """
    try:
        result = await file_service.process_file(file)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/types", response_model=List[FileTypeEnum])
async def get_supported_file_types():
    """
    Get a list of supported file types
    """
    return list(FileTypeEnum)

@router.get("/{file_id}", response_model=FileResponse)
async def get_file_info(file_id: str, file_service: FileService = Depends()):
    """
    Get file information by ID
    """
    try:
        result = await file_service.get_file_info(file_id)
        if not result:
            raise HTTPException(status_code=404, detail="File not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{file_id}")
async def delete_file(file_id: str, file_service: FileService = Depends()):
    """
    Delete a file by ID
    """
    try:
        success = await file_service.delete_file(file_id)
        if not success:
            raise HTTPException(status_code=404, detail="File not found")
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))