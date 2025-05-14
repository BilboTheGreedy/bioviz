import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from typing import List, Dict, Any, Optional, Union

from app.schemas.analysis import MethodConfig, AnalysisResult, VisualizationData

def get_config() -> MethodConfig:
    """
    Get the configuration for descriptive analysis.
    """
    return MethodConfig(
        name="Descriptive Analysis",
        description="Basic statistics and distributions of variables",
        parameters={
            "include_outliers": {
                "type": "boolean",
                "description": "Include outliers in boxplots and histograms",
                "default": True
            },
            "correlation_method": {
                "type": "string",
                "description": "Method for calculating correlations",
                "options": ["pearson", "spearman", "kendall"],
                "default": "pearson"
            },
            "bins": {
                "type": "integer",
                "description": "Number of bins for histograms",
                "min": 5,
                "max": 100,
                "default": 20
            }
        },
        supports_categorical=True,
        supports_numerical=True,
        default_visualizations=["histogram", "boxplot", "correlation"]
    )

def get_metadata() -> Dict[str, Any]:
    """
    Get detailed metadata for descriptive analysis.
    """
    return {
        "name": "Descriptive Analysis",
        "description": "Provides summary statistics and distributions of variables in the dataset",
        "use_cases": [
            "Understanding data distributions",
            "Identifying outliers",
            "Examining relationships between variables",
            "Getting basic insights about the dataset"
        ],
        "visualizations": [
            {
                "name": "Histogram",
                "description": "Distribution of numeric variables"
            },
            {
                "name": "Boxplot",
                "description": "Five-number summary with outliers"
            },
            {
                "name": "Correlation Matrix",
                "description": "Correlation between numeric variables"
            },
            {
                "name": "Bar Chart",
                "description": "Distribution of categorical variables"
            }
        ],
        "limitations": [
            "Only shows associations, not causation",
            "Limited for time-series analysis"
        ]
    }

def run_analysis(
    df: pd.DataFrame, 
    params: Dict[str, Any],
    target_columns: Optional[List[str]] = None
) -> AnalysisResult:
    """
    Run descriptive analysis on a dataset.
    """
    # Get parameters with defaults
    include_outliers = params.get("include_outliers", True)
    correlation_method = params.get("correlation_method", "pearson")
    bins = params.get("bins", 20)
    
    # Filter columns if specified
    if target_columns:
        df = df[target_columns]
    
    # Separate numeric and categorical columns
    numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    
    # Initialize result
    summary = {}
    visualizations = []
    tables = []
    
    # Basic statistics for numeric columns
    if numeric_cols:
        numeric_stats = df[numeric_cols].describe().transpose().reset_index()
        numeric_stats = numeric_stats.rename(columns={"index": "variable"})
        
        summary["numeric_stats"] = numeric_stats.to_dict(orient="records")
        
        # Create histograms for numeric columns
        for col in numeric_cols[:5]:  # Limit to first 5 columns for simplicity
            fig = px.histogram(df, x=col, nbins=bins, title=f"Distribution of {col}")
            
            vis_data = VisualizationData(
                type="histogram",
                data=fig.to_dict()["data"],
                layout=fig.to_dict()["layout"],
                config={"responsive": True}
            )
            
            visualizations.append(vis_data)
        
        # Create boxplots for numeric columns
        fig = px.box(
            df[numeric_cols[:5]].melt(), 
            x="variable", 
            y="value", 
            points="outliers" if include_outliers else False,
            title="Boxplots of Numeric Variables"
        )
        
        vis_data = VisualizationData(
            type="boxplot",
            data=fig.to_dict()["data"],
            layout=fig.to_dict()["layout"],
            config={"responsive": True}
        )
        
        visualizations.append(vis_data)
        
        # Correlation matrix
        corr_matrix = df[numeric_cols].corr(method=correlation_method).round(2)
        
        fig = px.imshow(
            corr_matrix,
            text_auto=True,
            color_continuous_scale="RdBu_r",
            title="Correlation Matrix"
        )
        
        vis_data = VisualizationData(
            type="heatmap",
            data=fig.to_dict()["data"],
            layout=fig.to_dict()["layout"],
            config={"responsive": True}
        )
        
        visualizations.append(vis_data)
        
        # Add correlation table
        tables.append({
            "name": "correlation_matrix",
            "title": "Correlation Matrix",
            "data": corr_matrix.reset_index().rename(columns={"index": "variable"}).to_dict(orient="records")
        })
    
    # Summary for categorical columns
    if categorical_cols:
        cat_summary = {}
        
        for col in categorical_cols:
            value_counts = df[col].value_counts().reset_index()
            value_counts.columns = ['value', 'count']
            value_counts['percentage'] = (value_counts['count'] / len(df) * 100).round(2)
            
            cat_summary[col] = value_counts.to_dict(orient="records")
            
            # Create bar charts for categorical columns
            if len(value_counts) <= 20:  # Only for categories with reasonable number of values
                fig = px.bar(
                    value_counts.sort_values('count', ascending=False).head(10),
                    x='value',
                    y='count',
                    title=f"Distribution of {col}"
                )
                
                vis_data = VisualizationData(
                    type="bar",
                    data=fig.to_dict()["data"],
                    layout=fig.to_dict()["layout"],
                    config={"responsive": True}
                )
                
                visualizations.append(vis_data)
        
        summary["categorical_stats"] = cat_summary
    
    # Missing values summary
    missing_data = df.isnull().sum().reset_index()
    missing_data.columns = ['column', 'missing_count']
    missing_data['missing_percentage'] = (missing_data['missing_count'] / len(df) * 100).round(2)
    missing_data = missing_data[missing_data['missing_count'] > 0]
    
    if not missing_data.empty:
        summary["missing_data"] = missing_data.to_dict(orient="records")
        
        # Create bar chart for missing values
        fig = px.bar(
            missing_data.sort_values('missing_count', ascending=False),
            x='column',
            y='missing_percentage',
            title="Missing Values (%)"
        )
        
        vis_data = VisualizationData(
            type="bar",
            data=fig.to_dict()["data"],
            layout=fig.to_dict()["layout"],
            config={"responsive": True}
        )
        
        visualizations.append(vis_data)
    
    # Basic dataset info
    summary["dataset_info"] = {
        "row_count": len(df),
        "column_count": len(df.columns),
        "numeric_columns": len(numeric_cols),
        "categorical_columns": len(categorical_cols),
        "memory_usage": f"{df.memory_usage(deep=True).sum() / (1024 * 1024):.2f} MB"
    }
    
    # Create result
    result = AnalysisResult(
        summary=summary,
        visualizations=visualizations,
        tables=tables,
        metadata={
            "analyzed_columns": df.columns.tolist(),
            "numeric_columns": numeric_cols,
            "categorical_columns": categorical_cols,
            "parameters": params
        }
    )
    
    return result