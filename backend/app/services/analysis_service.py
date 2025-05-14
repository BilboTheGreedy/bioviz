import os
import pandas as pd
import numpy as np
import json
import logging
import time
from typing import List, Dict, Any, Optional, Union, Tuple
from datetime import datetime

from app.core.config import settings
from app.schemas.analysis import (
    AnalysisMethod, 
    MethodConfig, 
    AvailableAnalyses, 
    AnalysisRequest,
    AnalysisResponse,
    AnalysisResult,
    VisualizationData
)

# Import analysis modules
from app.services.analysis import (
    descriptive,
    diagnostic,
    predictive,
    prescriptive,
    time_series,
    regression,
    cluster,
    factor,
    cohort,
    monte_carlo,
    text_analysis,
    qualitative
)

logger = logging.getLogger(__name__)

class AnalysisService:
    def __init__(self):
        # Register analysis modules
        self.analysis_modules = {
            AnalysisMethod.DESCRIPTIVE: descriptive,
            AnalysisMethod.DIAGNOSTIC: diagnostic,
            AnalysisMethod.PREDICTIVE: predictive,
            AnalysisMethod.PRESCRIPTIVE: prescriptive,
            AnalysisMethod.TIME_SERIES: time_series,
            AnalysisMethod.REGRESSION: regression,
            AnalysisMethod.CLUSTER: cluster,
            AnalysisMethod.FACTOR: factor,
            AnalysisMethod.COHORT: cohort,
            AnalysisMethod.MONTE_CARLO: monte_carlo,
            AnalysisMethod.TEXT_ANALYSIS: text_analysis,
            AnalysisMethod.QUALITATIVE: qualitative,
        }
    
    async def get_available_methods(self) -> AvailableAnalyses:
        """
        Get all available analysis methods and their configurations.
        """
        methods = {}
        
        for method, module in self.analysis_modules.items():
            config = module.get_config()
            methods[method.value] = config
        
        return AvailableAnalyses(methods=methods)
    
    async def get_method_metadata(self, method: AnalysisMethod) -> Dict[str, Any]:
        """
        Get detailed metadata for a specific analysis method.
        """
        if method not in self.analysis_modules:
            raise ValueError(f"Unknown analysis method: {method}")
        
        module = self.analysis_modules[method]
        return module.get_metadata()
    
    async def run_analysis(
        self, 
        file_path: str, 
        method: AnalysisMethod, 
        params: Dict[str, Any],
        target_columns: Optional[List[str]] = None,
        filter_conditions: Optional[Dict[str, Any]] = None
    ) -> AnalysisResponse:
        """
        Run an analysis on a dataset with specified parameters.
        """
        # Check if method exists
        if method not in self.analysis_modules:
            raise ValueError(f"Unknown analysis method: {method}")
        
        # Read the dataset
        df = self._read_dataset(file_path, filter_conditions)
        
        # Create request object
        request = AnalysisRequest(
            file_id=os.path.basename(file_path).split('_')[0],
            method=method,
            params=params,
            target_columns=target_columns,
            filter_conditions=filter_conditions
        )
        
        # Run the analysis
        start_time = time.time()
        module = self.analysis_modules[method]
        result = module.run_analysis(df, params, target_columns)
        execution_time = time.time() - start_time
        
        # Create response
        response = AnalysisResponse(
            request=request,
            result=result,
            execution_time=execution_time
        )
        
        return response
    
    def _read_dataset(
        self, 
        file_path: str,
        filter_conditions: Optional[Dict[str, Any]] = None
    ) -> pd.DataFrame:
        """
        Read a dataset from a file, applying filters if specified.
        """
        # Read the file based on extension
        if file_path.lower().endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.lower().endswith('.xlsx'):
            df = pd.read_excel(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_path}")
        
        # Apply filters if provided
        if filter_conditions:
            df = self._apply_filters(df, filter_conditions)
        
        return df
    
    def _apply_filters(self, df: pd.DataFrame, filters: Dict[str, Any]) -> pd.DataFrame:
        """
        Apply filters to a DataFrame.
        
        Filters format:
        {
            "column_name": {
                "operator": "==",  # or ">", "<", "!=", "in", "not in", "contains", etc.
                "value": value_to_filter_by
            }
        }
        """
        filtered_df = df.copy()
        
        for column, condition in filters.items():
            if column not in filtered_df.columns:
                continue
            
            operator = condition.get("operator")
            value = condition.get("value")
            
            if operator == "==":
                filtered_df = filtered_df[filtered_df[column] == value]
            elif operator == "!=":
                filtered_df = filtered_df[filtered_df[column] != value]
            elif operator == ">":
                filtered_df = filtered_df[filtered_df[column] > value]
            elif operator == "<":
                filtered_df = filtered_df[filtered_df[column] < value]
            elif operator == ">=":
                filtered_df = filtered_df[filtered_df[column] >= value]
            elif operator == "<=":
                filtered_df = filtered_df[filtered_df[column] <= value]
            elif operator == "in":
                filtered_df = filtered_df[filtered_df[column].isin(value)]
            elif operator == "not in":
                filtered_df = filtered_df[~filtered_df[column].isin(value)]
            elif operator == "contains":
                filtered_df = filtered_df[filtered_df[column].astype(str).str.contains(str(value), na=False)]
            elif operator == "not contains":
                filtered_df = filtered_df[~filtered_df[column].astype(str).str.contains(str(value), na=False)]
            elif operator == "between":
                if isinstance(value, list) and len(value) == 2:
                    filtered_df = filtered_df[(filtered_df[column] >= value[0]) & (filtered_df[column] <= value[1])]
            elif operator == "is null":
                filtered_df = filtered_df[filtered_df[column].isna()]
            elif operator == "is not null":
                filtered_df = filtered_df[~filtered_df[column].isna()]
        
        return filtered_df