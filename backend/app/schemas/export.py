from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union

class ExportRequest(BaseModel):
    fig_json: Dict[str, Any]
    format: str = "png"  # 'png' or 'svg'
    width: Optional[int] = None
    height: Optional[int] = None
    scale: Optional[float] = 1.0
    filename: Optional[str] = None

class SlideRequest(BaseModel):
    fig_json: Dict[str, Any]
    title: str
    caption: Optional[str] = None
    filename: Optional[str] = None
