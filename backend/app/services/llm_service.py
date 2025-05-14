import os
import json
import logging
import time
import asyncio
import re
from typing import List, Dict, Any, Optional, Union, AsyncGenerator, Tuple
from datetime import datetime

# Import LLM providers based on configuration
from app.core.config import settings
from app.schemas.llm import QueryRequest, QueryResponse, ChatMessage, CodeExecutionResult

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        # Initialize LLM based on configuration
        self.model_type = settings.llm.model_type
        self.model_path = settings.llm.model_path
        self.server_url = settings.llm.server_url
        self.context_window = settings.llm.context_window
        self.max_tokens = settings.llm.max_tokens
        self.temperature = settings.llm.temperature
        self.top_p = settings.llm.top_p
        
        # Initialize appropriate client based on model type
        if self.model_type == "llama":
            from app.utils.llm_clients import LlamaClient
            self.client = LlamaClient(
                model_path=self.model_path,
                server_url=self.server_url,
                context_window=self.context_window,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                top_p=self.top_p
            )
        elif self.model_type == "ollama":
            from app.utils.llm_clients import OllamaClient
            self.client = OllamaClient(
                server_url=self.server_url,
                context_window=self.context_window,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                top_p=self.top_p
            )
        elif self.model_type == "huggingface":
            from app.utils.llm_clients import HuggingFaceClient
            self.client = HuggingFaceClient(
                model_path=self.model_path,
                context_window=self.context_window,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                top_p=self.top_p
            )
        else:
            raise ValueError(f"Unsupported LLM type: {self.model_type}")
        
        # Stream history for WebSocket streaming
        self.stream_history = []
    
    async def process_query(
        self,
        query: str,
        file_path: str,
        schema_info: Dict[str, Any],
        data_sample: Dict[str, Any],
        chat_history: Optional[List[ChatMessage]] = None
    ) -> QueryResponse:
        """
        Process a natural language query about a dataset.
        """
        start_time = time.time()
        
        # Build prompt with context
        prompt = self._build_prompt(query, schema_info, data_sample, chat_history)
        
        # Call LLM
        response_text = await self.client.generate(prompt)
        
        # Extract explanation and code
        explanation, code, execution_type = self._extract_code_from_response(response_text)
        
        # Create response
        response = QueryResponse(
            explanation=explanation,
            code=code,
            execution_type=execution_type,
            result=None,  # Will be populated after code execution
            query_time=time.time() - start_time
        )
        
        return response
    
    async def stream_response(
        self,
        query: str,
        file_path: str,
        schema_info: Dict[str, Any],
        data_sample: Dict[str, Any],
        chat_history: Optional[List[ChatMessage]] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream responses for queries via WebSocket.
        """
        # Reset stream history
        self.stream_history = []
        
        # Build prompt with context
        prompt = self._build_prompt(query, schema_info, data_sample, chat_history)
        
        # Stream from LLM
        async for chunk in self.client.generate_stream(prompt):
            # Add to history
            self.stream_history.append(chunk)
            
            # Yield the chunk
            yield {"type": "text", "data": chunk}
    
    async def extract_code_from_stream_history(self) -> QueryResponse:
        """
        Extract code from the streamed response history.
        """
        # Combine all chunks
        full_response = "".join(self.stream_history)
        
        # Extract explanation and code
        explanation, code, execution_type = self._extract_code_from_response(full_response)
        
        # Create response
        response = QueryResponse(
            explanation=explanation,
            code=code,
            execution_type=execution_type,
            result=None,  # Will be populated after code execution
            query_time=0.0  # Not tracking time for streaming
        )
        
        return response
    
    def _build_prompt(self, query: str, schema_info: Dict[str, Any], data_sample: Dict[str, Any], chat_history: Optional[List[ChatMessage]] = None) -> str:
        """
        Build a prompt for the LLM with context about the dataset.
        """
        # Convert schema_info and data_sample to formatted strings
        schema_str = json.dumps(schema_info, indent=2)
        sample_str = json.dumps(data_sample, indent=2)
        
        # Format chat history if provided
        history_str = ""
        if chat_history and len(chat_history) > 0:
            history_str = "\n\nPrevious conversation:\n"
            for message in chat_history:
                role = "User" if message.role == "user" else "Assistant"
                history_str += f"\n{role}: {message.content}\n"
        
        # Build the prompt
        prompt = f"""
        You are a data analysis assistant that helps analyze datasets and create visualizations.
        Given the dataset information below, answer the user's question with an explanation and executable Python code.
        
        DATASET SCHEMA:
        ```json
        {schema_str}
        ```
        
        DATA SAMPLE:
        ```json
        {sample_str}
        ```
        {history_str}
        
        USER QUESTION: {query}
        
        Please provide:
        1. A clear explanation of your approach to answering this question.
        2. Python code that uses pandas, matplotlib, or plotly to analyze and visualize the data.
        
        Your code should be enclosed in ```python and ``` tags, like this:
        
        ```python
        # Your Python code here
        import pandas as pd
        import plotly.express as px
        
        # Load the dataset
        # Analysis code
        # Create visualization
        ```
        
        Keep your explanation concise and focus on generating correct, executable code that answers the question.
        """
        
        return prompt
    
    def _extract_code_from_response(self, response_text: str) -> Tuple[str, Optional[str], str]:
        """
        Extract explanation and code from the LLM response.
        """
        # Extract code blocks
        code_matches = re.findall(r'```(?:python)?\s*(.*?)\s*```', response_text, re.DOTALL)
        
        # If no code blocks found, return just the explanation
        if not code_matches:
            return response_text, None, "python"
        
        # Get the first code block
        code = code_matches[0].strip()
        
        # Remove the code blocks from the response to get the explanation
        explanation = re.sub(r'```(?:python)?\s*.*?\s*```', '', response_text, flags=re.DOTALL).strip()
        
        return explanation, code, "python"