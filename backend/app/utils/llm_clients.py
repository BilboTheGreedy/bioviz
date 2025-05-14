import os
import json
import logging
import aiohttp
import asyncio
from typing import List, Dict, Any, Optional, Union, AsyncGenerator
import requests
from datetime import datetime

logger = logging.getLogger(__name__)

class LlamaClient:
    """
    Client for llama.cpp server with compatible OpenAI API endpoints.
    Uses the /v1/chat/completions endpoint.
    """
    def __init__(
        self,
        model_path: str,
        server_url: str,
        context_window: int = 8192,
        max_tokens: int = 4096,
        temperature: float = 0.7,
        top_p: float = 0.95
    ):
        self.model_path = model_path
        self.server_url = server_url
        self.context_window = context_window
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.top_p = top_p
        
        # Endpoint for chat completions
        self.completions_url = f"{self.server_url}/v1/chat/completions"
    
    async def generate(self, prompt: str) -> str:
        """
        Generate a response for the given prompt.
        """
        try:
            # Prepare request payload
            payload = {
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": self.max_tokens,
                "temperature": self.temperature,
                "top_p": self.top_p,
                "stream": False
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.completions_url, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"Error from LLM server: {error_text}")
                        return f"Error: {response.status} - {error_text}"
                    
                    result = await response.json()
                    return result["choices"][0]["message"]["content"]
        
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return f"Error: {str(e)}"
    
    async def generate_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        """
        Stream a response for the given prompt.
        """
        try:
            # Prepare request payload
            payload = {
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": self.max_tokens,
                "temperature": self.temperature,
                "top_p": self.top_p,
                "stream": True
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.completions_url, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"Error from LLM server: {error_text}")
                        yield f"Error: {response.status} - {error_text}"
                        return
                    
                    # Process the stream
                    async for line in response.content:
                        line = line.decode('utf-8')
                        if line.startswith('data: ') and not line.startswith('data: [DONE]'):
                            data = json.loads(line[6:])
                            if 'choices' in data and len(data['choices']) > 0:
                                delta = data['choices'][0].get('delta', {})
                                content = delta.get('content', '')
                                if content:
                                    yield content
        
        except Exception as e:
            logger.error(f"Error streaming response: {str(e)}")
            yield f"Error: {str(e)}"

class OllamaClient:
    """
    Client for Ollama API server.
    """
    def __init__(
        self,
        server_url: str,
        context_window: int = 8192,
        max_tokens: int = 4096,
        temperature: float = 0.7,
        top_p: float = 0.95
    ):
        self.server_url = server_url
        self.context_window = context_window
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.top_p = top_p
        
        # Endpoint for completions
        self.completions_url = f"{self.server_url}/api/generate"
    
    async def generate(self, prompt: str) -> str:
        """
        Generate a response for the given prompt.
        """
        try:
            # Prepare request payload
            payload = {
                "prompt": prompt,
                "model": "llama2",  # Default model, can be configured
                "max_tokens": self.max_tokens,
                "temperature": self.temperature,
                "top_p": self.top_p,
                "stream": False
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.completions_url, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"Error from Ollama server: {error_text}")
                        return f"Error: {response.status} - {error_text}"
                    
                    result = await response.json()
                    return result["response"]
        
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return f"Error: {str(e)}"
    
    async def generate_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        """
        Stream a response for the given prompt.
        """
        try:
            # Prepare request payload
            payload = {
                "prompt": prompt,
                "model": "llama2",  # Default model, can be configured
                "max_tokens": self.max_tokens,
                "temperature": self.temperature,
                "top_p": self.top_p,
                "stream": True
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.completions_url, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"Error from Ollama server: {error_text}")
                        yield f"Error: {response.status} - {error_text}"
                        return
                    
                    # Process the stream
                    async for line in response.content:
                        if line:
                            data = json.loads(line)
                            if 'response' in data:
                                yield data['response']
        
        except Exception as e:
            logger.error(f"Error streaming response: {str(e)}")
            yield f"Error: {str(e)}"

class HuggingFaceClient:
    """
    Client for HuggingFace transformers models running locally.
    """
    def __init__(
        self,
        model_path: str,
        context_window: int = 8192,
        max_tokens: int = 4096,
        temperature: float = 0.7,
        top_p: float = 0.95
    ):
        self.model_path = model_path
        self.context_window = context_window
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.top_p = top_p
        
        # Lazy loading of transformers to avoid loading if not used
        self.model = None
        self.tokenizer = None
    
    def _load_model(self):
        """
        Load the model and tokenizer.
        """
        try:
            import torch
            from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer
            
            # Load tokenizer and model
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_path,
                torch_dtype=torch.float16,
                device_map="auto"
            )
            
            # Save streamer class for streaming
            self.TextIteratorStreamer = TextIteratorStreamer
        
        except Exception as e:
            logger.error(f"Error loading HuggingFace model: {str(e)}")
            raise
    
    async def generate(self, prompt: str) -> str:
        """
        Generate a response for the given prompt.
        """
        try:
            # Load model if not loaded
            if self.model is None:
                self._load_model()
            
            # Tokenize the prompt
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
            
            # Generate response
            import torch
            with torch.no_grad():
                output = self.model.generate(
                    inputs["input_ids"],
                    max_length=inputs["input_ids"].shape[1] + self.max_tokens,
                    temperature=self.temperature,
                    top_p=self.top_p,
                    do_sample=True
                )
            
            # Decode the response
            response = self.tokenizer.decode(output[0], skip_special_tokens=True)
            
            # Remove the prompt from the response
            return response[len(prompt):]
        
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return f"Error: {str(e)}"
    
    async def generate_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        """
        Stream a response for the given prompt.
        """
        try:
            # Load model if not loaded
            if self.model is None:
                self._load_model()
            
            # Tokenize the prompt
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
            
            # Set up the streamer
            streamer = self.TextIteratorStreamer(self.tokenizer, skip_special_tokens=True)
            
            # Start generation in a separate thread
            import threading
            import torch
            generation_kwargs = {
                "input_ids": inputs["input_ids"],
                "max_length": inputs["input_ids"].shape[1] + self.max_tokens,
                "temperature": self.temperature,
                "top_p": self.top_p,
                "do_sample": True,
                "streamer": streamer
            }
            
            thread = threading.Thread(target=self.model.generate, kwargs=generation_kwargs)
            thread.start()
            
            # Stream the output
            prompt_tokens = len(self.tokenizer.encode(prompt))
            
            for text in streamer:
                yield text
        
        except Exception as e:
            logger.error(f"Error streaming response: {str(e)}")
            yield f"Error: {str(e)}"