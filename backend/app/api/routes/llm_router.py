from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks, Body
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any, Optional, Union
import logging
import json
import asyncio
from pydantic import BaseModel, Field

from app.services.llm_service import LLMService
from app.services.file_service import FileService
from app.services.code_execution_service import CodeExecutionService
from app.schemas.llm import QueryRequest, QueryResponse, ChatMessage, ChatHistory

router = APIRouter()
llm_service = LLMService()
file_service = FileService()
code_execution_service = CodeExecutionService()
logger = logging.getLogger(__name__)

@router.post("/query", response_model=QueryResponse)
async def query_data(request: QueryRequest):
    """
    Process a natural language query about a dataset.
    """
    try:
        # Verify the file exists
        file_path = file_service.get_file_path_from_id(request.file_id)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Get dataset metadata
        schema_info = await file_service.get_schema_info(file_path)
        data_sample = await file_service.get_data_preview(file_path, 0, 10)
        
        # Process the query with LLM
        response = await llm_service.process_query(
            query=request.query,
            file_path=file_path,
            schema_info=schema_info,
            data_sample=data_sample,
            chat_history=request.chat_history
        )
        
        # If response contains code, execute it
        if response.code:
            execution_result = await code_execution_service.execute_code(
                code=response.code,
                file_path=file_path,
                execution_type=response.execution_type
            )
            response.result = execution_result
        
        return response
    
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/query-stream")
async def stream_query(websocket: WebSocket):
    """
    Stream responses for queries via WebSocket.
    """
    await websocket.accept()
    
    try:
        while True:
            # Receive the query request
            data = await websocket.receive_text()
            request_data = json.loads(data)
            request = QueryRequest(**request_data)
            
            # Verify the file exists
            file_path = file_service.get_file_path_from_id(request.file_id)
            if not file_path:
                await websocket.send_json({"error": "File not found"})
                continue
            
            # Get dataset metadata
            schema_info = await file_service.get_schema_info(file_path)
            data_sample = await file_service.get_data_preview(file_path, 0, 10)
            
            # Stream LLM response
            async for chunk in llm_service.stream_response(
                query=request.query,
                file_path=file_path,
                schema_info=schema_info,
                data_sample=data_sample,
                chat_history=request.chat_history
            ):
                await websocket.send_json(chunk)
            
            # Extract code from the response if any
            final_response = await llm_service.extract_code_from_stream_history()
            
            # Execute code if present
            if final_response.code:
                execution_result = await code_execution_service.execute_code(
                    code=final_response.code,
                    file_path=file_path,
                    execution_type=final_response.execution_type
                )
                await websocket.send_json({"type": "execution_result", "data": execution_result})
            
            # Send completion message
            await websocket.send_json({"type": "done"})
    
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"Error in WebSocket: {str(e)}")
        await websocket.send_json({"error": str(e)})

@router.post("/execute-code", response_model=Dict[str, Any])
async def execute_code(file_id: str, code: str = Body(...), execution_type: str = Body("python")):
    """
    Execute user-modified code against a dataset.
    """
    try:
        # Verify the file exists
        file_path = file_service.get_file_path_from_id(file_id)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Execute the code
        result = await code_execution_service.execute_code(
            code=code,
            file_path=file_path,
            execution_type=execution_type
        )
        
        return {"result": result}
    
    except Exception as e:
        logger.error(f"Error executing code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
