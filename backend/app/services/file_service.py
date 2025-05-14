import os
import re
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional, Union, Tuple
from datetime import datetime
import logging
import glob

from app.core.config import settings
from app.schemas.file import FileInfo, SchemaInfo, DatasetPreview, ColumnInfo

logger = logging.getLogger(__name__)

class FileService:
    def __init__(self):
        self.upload_dir = settings.upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)
    
    async def get_file_info(self, file_path: str, original_filename: Optional[str] = None) -> FileInfo:
        """
        Get basic information about an uploaded file.
        """
        try:
            # Extract file ID from path
            file_id = os.path.basename(file_path).split('_')[0]
            
            # Get file stats
            file_stats = os.stat(file_path)
            file_size = file_stats.st_size
            created_at = datetime.fromtimestamp(file_stats.st_ctime)
            
            # If original filename not provided, use the base name
            if not original_filename:
                original_filename = os.path.basename(file_path)
            
            # Read a small sample to get row and column counts
            if file_path.lower().endswith('.csv'):
                df_sample = pd.read_csv(file_path, nrows=5)
            elif file_path.lower().endswith('.xlsx'):
                df_sample = pd.read_excel(file_path, nrows=5)
            else:
                raise ValueError(f"Unsupported file format: {file_path}")
            
            # Get an estimate of the total row count for larger files
            if file_size > 10 * 1024 * 1024:  # If file > 10MB
                # Estimate based on first 1000 rows
                if file_path.lower().endswith('.csv'):
                    df_estimate = pd.read_csv(file_path, nrows=1000)
                else:
                    df_estimate = pd.read_excel(file_path, nrows=1000)
                
                sample_size_bytes = df_estimate.memory_usage(deep=True).sum()
                row_count_estimate = int((file_size / (sample_size_bytes / len(df_estimate))) * 0.95)  # 0.95 as a safety factor
                row_count = min(row_count_estimate, 1_000_000)  # Cap at 1M for UI
            else:
                # For smaller files, count the actual rows
                if file_path.lower().endswith('.csv'):
                    row_count = sum(1 for _ in open(file_path, 'r')) - 1  # Subtract header
                else:
                    df_full = pd.read_excel(file_path)
                    row_count = len(df_full)
            
            # Create file info object
            file_info = FileInfo(
                file_id=file_id,
                original_filename=original_filename,
                file_path=file_path,
                file_size=file_size,
                created_at=created_at,
                row_count=row_count,
                column_count=len(df_sample.columns),
                preview_available=True
            )
            
            return file_info
        
        except Exception as e:
            logger.error(f"Error getting file info: {str(e)}")
            raise
    
    async def get_schema_info(self, file_path: str) -> SchemaInfo:
        """
        Get detailed schema information for a file.
        """
        try:
            # Determine file type
            file_type = "csv" if file_path.lower().endswith('.csv') else "excel"
            
            # Read the file
            if file_type == "csv":
                df = pd.read_csv(file_path, nrows=10000)  # Read a sample for large files
            else:
                df = pd.read_excel(file_path, nrows=10000)
            
            # Get column information
            columns = []
            for col_name in df.columns:
                col_data = df[col_name]
                dtype_name = str(col_data.dtype)
                
                # Determine if column is nullable
                nullable = col_data.isna().any()
                
                # Count unique values (up to 1000 for efficiency)
                try:
                    unique_values = min(col_data.nunique(), 1000)
                except:
                    unique_values = None
                
                # Get min and max values for numeric columns
                min_value = None
                max_value = None
                if pd.api.types.is_numeric_dtype(col_data):
                    if not col_data.isna().all():
                        min_value = float(col_data.min())
                        max_value = float(col_data.max())
                
                # Get sample values
                sample_values = col_data.dropna().sample(min(5, len(col_data))).tolist() if len(col_data) > 0 else []
                
                # Count missing values
                missing_count = col_data.isna().sum()
                missing_percentage = (missing_count / len(df)) * 100 if len(df) > 0 else 0.0
                
                # Create column info
                columns.append(ColumnInfo(
                    name=col_name,
                    dtype=dtype_name,
                    nullable=nullable,
                    unique_values=unique_values,
                    min_value=min_value,
                    max_value=max_value,
                    sample_values=sample_values,
                    missing_count=missing_count,
                    missing_percentage=missing_percentage
                ))
            
            # Get memory usage
            memory_usage = f"{df.memory_usage(deep=True).sum() / (1024 * 1024):.2f} MB"
            
            # Get file size
            file_size = f"{os.path.getsize(file_path) / (1024 * 1024):.2f} MB"
            
            # Create schema info
            schema_info = SchemaInfo(
                columns=columns,
                row_count=len(df),
                memory_usage=memory_usage,
                file_size=file_size,
                file_type=file_type
            )
            
            return schema_info
        
        except Exception as e:
            logger.error(f"Error getting schema info: {str(e)}")
            raise
    
    async def get_data_preview(self, file_path: str, start: int = 0, limit: int = 100) -> DatasetPreview:
        """
        Get a preview of the dataset with pagination.
        """
        try:
            # Determine file type
            file_type = "csv" if file_path.lower().endswith('.csv') else "excel"
            
            # Read the file with pagination
            if file_type == "csv":
                # For CSV, we can use skiprows and nrows for pagination
                df = pd.read_csv(file_path, skiprows=range(1, start+1), nrows=limit)
                # Get total rows
                total_rows = sum(1 for _ in open(file_path, 'r')) - 1  # Subtract header
            else:
                # For Excel, we need to read the whole sheet and then slice
                df_full = pd.read_excel(file_path)
                total_rows = len(df_full)
                end = min(start + limit, total_rows)
                df = df_full.iloc[start:end]
            
            # Convert to list of dicts for JSON serialization
            # Handle NaN, NaT, etc.
            df = df.replace({np.nan: None})
            data = df.to_dict(orient="records")
            
            # Create preview object
            preview = DatasetPreview(
                data=data,
                total_rows=total_rows,
                displayed_rows=len(data),
                start_index=start,
                has_more=(start + limit) < total_rows
            )
            
            return preview
        
        except Exception as e:
            logger.error(f"Error getting data preview: {str(e)}")
            raise
    
    async def list_files(self) -> List[FileInfo]:
        """
        List all uploaded files.
        """
        try:
            files = []
            
            # Get all files in the upload directory
            for ext in settings.allowed_extensions:
                file_pattern = os.path.join(self.upload_dir, f"*{ext}")
                for file_path in glob.glob(file_pattern):
                    file_info = await self.get_file_info(file_path)
                    files.append(file_info)
            
            # Sort by creation time (newest first)
            files.sort(key=lambda x: x.created_at, reverse=True)
            
            return files
        
        except Exception as e:
            logger.error(f"Error listing files: {str(e)}")
            raise
    
    async def delete_file(self, file_id: str) -> bool:
        """
        Delete a file by ID.
        """
        try:
            # Find the file path from ID
            file_path = self.get_file_path_from_id(file_id)
            if not file_path:
                return False
            
            # Delete the file
            os.remove(file_path)
            return True
        
        except Exception as e:
            logger.error(f"Error deleting file {file_id}: {str(e)}")
            raise
    
    def get_file_path_from_id(self, file_id: str) -> Optional[str]:
        """
        Find a file path from its ID.
        """
        try:
            # Search for files with the ID prefix
            for ext in settings.allowed_extensions:
                file_pattern = os.path.join(self.upload_dir, f"{file_id}_*{ext}")
                matches = glob.glob(file_pattern)
                if matches:
                    return matches[0]
            
            return None
        
        except Exception as e:
            logger.error(f"Error getting file path for {file_id}: {str(e)}")
            raise