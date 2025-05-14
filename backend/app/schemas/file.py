from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
from datetime import datetime

class ColumnInfo(BaseModel):
    name: str
    dtype: str
    nullable: bool
    unique_values: Optional[int] = None
    min_value: Optional[Union[float, int, str]] = None
    max_value: Optional[Union[float, int, str]] = None
    sample_values: Optional[List[Any]] = None
    missing_count: Optional[int] = None
    missing_percentage: Optional[float] = None

class SchemaInfo(BaseModel):
    columns: List[ColumnInfo]
    row_count: int
    memory_usage: str
    file_size: str
    file_type: str

class FileInfo(BaseModel):
    file_id: str
    original_filename: str
    file_path: str
    file_size: int
    created_at: datetime
    row_count: int
    column_count: int
    preview_available: bool

class DatasetPreview(BaseModel):
    data: List[Dict[str, Any]]
    total_rows: int
    displayed_rows: int
    start_index: int
    has_more: bool
