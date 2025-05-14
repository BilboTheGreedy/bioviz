import os
import uuid
import pandas as pd
from fastapi import UploadFile, Depends
from datetime import datetime
from typing import Optional, Dict, Any, BinaryIO

from schemas.file import FileResponse, FileTypeEnum, FileMetadata
from db.database import get_db


class FileService:
    def __init__(self, db=Depends(get_db)):
        self.db = db
        self.upload_dir = os.path.join(os.getcwd(), "uploads")
        os.makedirs(self.upload_dir, exist_ok=True)

    async def process_file(self, file: UploadFile) -> FileResponse:
        """Process uploaded file and store metadata"""
        file_id = str(uuid.uuid4())
        file_path = os.path.join(self.upload_dir, file_id)
        
        # Determine file type from extension
        file_type = self._get_file_type(file.filename)
        
        # Save file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Extract metadata based on file type
        metadata = await self._extract_metadata(file_path, file_type, file.filename, len(content))
        
        # Store in database
        now = datetime.now()
        file_data = {
            "id": file_id,
            "file_type": file_type,
            "metadata": metadata.dict(),
            "created_at": now,
            "updated_at": now,
            "status": "ready",
            "preview_url": f"/api/files/{file_id}/preview",
        }
        
        # Save to database
        await self.db.files.insert_one(file_data)
        
        return FileResponse(**file_data)

    async def get_file_info(self, file_id: str) -> Optional[FileResponse]:
        """Get file information by ID"""
        file_data = await self.db.files.find_one({"id": file_id})
        if not file_data:
            return None
        
        return FileResponse(**file_data)

    async def delete_file(self, file_id: str) -> bool:
        """Delete a file by ID"""
        file_data = await self.db.files.find_one({"id": file_id})
        if not file_data:
            return False
        
        # Delete physical file
        file_path = os.path.join(self.upload_dir, file_id)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete from database
        await self.db.files.delete_one({"id": file_id})
        
        return True

    def _get_file_type(self, filename: str) -> FileTypeEnum:
        """Determine file type from filename"""
        if not filename:
            return FileTypeEnum.OTHER
            
        ext = filename.split(".")[-1].lower()
        
        if ext in ["fa", "fasta"]:
            return FileTypeEnum.FASTA
        elif ext in ["fq", "fastq"]:
            return FileTypeEnum.FASTQ
        elif ext == "csv":
            return FileTypeEnum.CSV
        elif ext in ["tsv", "tab"]:
            return FileTypeEnum.TSV
        elif ext == "vcf":
            return FileTypeEnum.VCF
        elif ext == "bam":
            return FileTypeEnum.BAM
        elif ext == "gtf":
            return FileTypeEnum.GTF
        elif ext == "bed":
            return FileTypeEnum.BED
        elif ext == "json":
            return FileTypeEnum.JSON
        else:
            return FileTypeEnum.OTHER

    async def _extract_metadata(
        self, file_path: str, file_type: FileTypeEnum, filename: str, size_bytes: int
    ) -> FileMetadata:
        """Extract metadata based on file type"""
        metadata = {
            "filename": filename,
            "size_bytes": size_bytes,
            "content_type": self._get_content_type(file_type),
        }
        
        # Extract file-specific metadata
        if file_type in [FileTypeEnum.CSV, FileTypeEnum.TSV]:
            separator = "," if file_type == FileTypeEnum.CSV else "\t"
            try:
                df = pd.read_csv(file_path, sep=separator, nrows=10)
                metadata["rows"] = len(df)
                metadata["columns"] = len(df.columns)
                metadata["sample_data"] = df.head(5).to_dict()
            except Exception:
                pass
        
        elif file_type == FileTypeEnum.FASTA:
            try:
                sequence_count = 0
                with open(file_path, "r") as f:
                    for line in f:
                        if line.startswith(">"):
                            sequence_count += 1
                metadata["sequence_count"] = sequence_count
            except Exception:
                pass
        
        return FileMetadata(**metadata)

    def _get_content_type(self, file_type: FileTypeEnum) -> str:
        """Get MIME content type based on file type"""
        content_types = {
            FileTypeEnum.CSV: "text/csv",
            FileTypeEnum.TSV: "text/tab-separated-values",
            FileTypeEnum.FASTA: "text/plain",
            FileTypeEnum.FASTQ: "text/plain",
            FileTypeEnum.VCF: "text/plain",
            FileTypeEnum.BAM: "application/octet-stream",
            FileTypeEnum.GTF: "text/plain",
            FileTypeEnum.BED: "text/plain",
            FileTypeEnum.JSON: "application/json",
            FileTypeEnum.OTHER: "application/octet-stream",
        }
        return content_types.get(file_type, "application/octet-stream")