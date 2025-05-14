from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
from datetime import datetime

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant' or 'system'
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)

class ChatHistory(BaseModel):
    messages: List[ChatMessage] = Field(default_factory=list)

class QueryRequest(BaseModel):
    file_id: str
    query: str
    chat_history: Optional[List[ChatMessage]] = Field(default_factory=list)

class CodeExecutionResult(BaseModel):
    output: Any
    error: Optional[str] = None
    visualizations: Optional[List[Dict[str, Any]]] = None
    tables: Optional[List[Dict[str, Any]]] = None
    execution_time: float

class QueryResponse(BaseModel):
    explanation: str
    code: Optional[str] = None
    execution_type: str = "python"  # Default to Python execution
    result: Optional[CodeExecutionResult] = None
    query_time: float
