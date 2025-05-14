from enum import Enum
from pydantic import BaseModel, Field
from typing import Dict, Optional, Any
from datetime import datetime


class FileTypeEnum(str, Enum):
    FASTA = "fasta"
    FASTQ = "fastq"
    CSV = "csv"
    TSV = "tsv"
    VCF = "vcf"
    BAM = "bam"
    GTF = "gtf"
    BED = "bed"
    JSON = "json"
    OTHER = "other"


class FileMetadata(BaseModel):
    """Metadata for the uploaded file"""
    filename: str
    size_bytes: int
    content_type: str
    rows: Optional[int] = None
    columns: Optional[int] = None
    sequence_count: Optional[int] = None
    sample_data: Optional[Dict[str, Any]] = None


class FileResponse(BaseModel):
    """Response model for file operations"""
    id: str = Field(..., description="Unique file identifier")
    file_type: FileTypeEnum
    metadata: FileMetadata
    created_at: datetime
    updated_at: datetime
    status: str = Field(..., description="Processing status")
    preview_url: Optional[str] = None