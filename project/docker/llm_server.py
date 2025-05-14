"""
LLM Server for Bioinformatics Visualizer

This service provides an API for running local LLM models for bioinformatics
data analysis and interpretation.
"""

import os
import json
import logging
from typing import List, Optional, Dict, Any, Union
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Bioinformatics LLM API",
    description="API for interacting with local LLMs for bioinformatics data analysis",
    version="0.1.0",
)

# Path to models directory
MODELS_DIR = os.environ.get("MODELS_DIR", "/models")

# Define model schemas
class ModelInfo(BaseModel):
    """Information about an available model"""
    id: str
    name: str
    type: str
    description: str
    context_window: int
    parameters: Optional[str] = None
    version: Optional[str] = None


class QueryRequest(BaseModel):
    """Request for querying the LLM"""
    model_id: str
    prompt: str
    system_prompt: Optional[str] = None
    temperature: float = Field(0.7, ge=0, le=1.0)
    max_tokens: Optional[int] = None
    context: Optional[Dict[str, Any]] = None


class Citation(BaseModel):
    """Citation for a response"""
    text: str
    url: Optional[str] = None
    title: Optional[str] = None
    authors: Optional[List[str]] = None
    year: Optional[int] = None


class QueryResponse(BaseModel):
    """Response from the LLM query"""
    id: str
    model_id: str
    prompt: str
    response: str
    citations: Optional[List[Citation]] = None
    confidence: Optional[float] = None
    usage: Dict[str, Any] = Field(default_factory=dict)


# Global variable to store loaded models
loaded_models = {}

# In-memory storage for available models
available_models = {
    "llama2-7b-chat": ModelInfo(
        id="llama2-7b-chat",
        name="Llama 2 7B Chat",
        type="general",
        description="General purpose chat model",
        context_window=4096,
        parameters="7B",
        version="2"
    ),
    "bio-llama-7b": ModelInfo(
        id="bio-llama-7b",
        name="BioLlama 7B",
        type="biomedical",
        description="Specialized for biomedical data",
        context_window=4096,
        parameters="7B",
        version="1.0"
    ),
    "proteingpt": ModelInfo(
        id="proteingpt",
        name="ProteinGPT",
        type="protein",
        description="Specialized for protein sequence analysis",
        context_window=2048,
        parameters="3B",
        version="1.0"
    ),
    "genomics-llama": ModelInfo(
        id="genomics-llama",
        name="Genomics Llama",
        type="genomics",
        description="Specialized for genomics data",
        context_window=4096,
        parameters="7B",
        version="1.0"
    ),
}


def load_model(model_id: str):
    """Load a model from disk if it's not already loaded"""
    if model_id not in loaded_models:
        if model_id not in available_models:
            raise ValueError(f"Model {model_id} not found")
            
        logger.info(f"Loading model: {model_id}")
        
        try:
            # Path to the model file
            model_path = os.path.join(MODELS_DIR, f"{model_id}.gguf")
            
            # In a real application, we would load the model here
            # For demonstration purposes, we'll just create a placeholder
            
            # Example of how you would load a model with llama-cpp-python:
            # from llama_cpp import Llama
            # model = Llama(
            #     model_path=model_path,
            #     n_ctx=available_models[model_id].context_window,
            #     n_gpu_layers=-1,  # Load all layers to GPU
            # )
            
            # For now, just store the model info
            loaded_models[model_id] = {
                "id": model_id,
                "info": available_models[model_id]
            }
            
            logger.info(f"Model {model_id} loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model {model_id}: {str(e)}")
            raise
    
    return loaded_models[model_id]


@app.get("/models", response_model=List[ModelInfo])
async def get_available_models():
    """Get a list of available models"""
    return list(available_models.values())


@app.post("/query", response_model=QueryResponse)
async def query_model(request: QueryRequest):
    """Query an LLM model"""
    try:
        # Load the model
        model = load_model(request.model_id)
        
        # Prepare the query
        system_prompt = request.system_prompt or "You are a bioinformatics assistant. Your task is to help researchers analyze and interpret biological data."
        
        # In a real application, we would query the model here
        # For demonstration purposes, we'll just return a placeholder response
        
        # Example of how you would query a llama-cpp-python model:
        # response = model.create_completion(
        #     prompt=f"<s>[INST] <<SYS>>\n{system_prompt}\n<</SYS>>\n\n{request.prompt} [/INST]",
        #     temperature=request.temperature,
        #     max_tokens=request.max_tokens or 2048,
        # )
        # response_text = response["choices"][0]["text"]
        
        # For demonstration, create a placeholder response
        import uuid
        import time
        
        response_text = f"This is a simulated response to: '{request.prompt}'"
        
        # If context is provided, add it to the response
        if request.context:
            if "file_type" in request.context:
                response_text += f"\n\nBased on your {request.context['file_type']} file, "
                
                if request.context['file_type'] == 'fasta':
                    response_text += "I can help you analyze these protein or nucleotide sequences. Consider running a sequence alignment or phylogenetic analysis."
                elif request.context['file_type'] in ['csv', 'tsv']:
                    response_text += "I can help you analyze this tabular data. Consider exploring the data distribution or running a clustering analysis."
                else:
                    response_text += "I can help you analyze this data appropriately."
        
        # Add a citation for demonstration
        citations = [
            Citation(
                text="Smith et al. (2023). Advances in Bioinformatics Data Analysis.",
                url="https://example.com/paper1",
                title="Advances in Bioinformatics Data Analysis",
                authors=["Smith, J.", "Johnson, A."],
                year=2023
            )
        ]
        
        # Create the response
        response = QueryResponse(
            id=str(uuid.uuid4()),
            model_id=request.model_id,
            prompt=request.prompt,
            response=response_text,
            citations=citations,
            confidence=0.92,
            usage={
                "prompt_tokens": 150,
                "completion_tokens": 50,
                "total_tokens": 200
            }
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "models_loaded": list(loaded_models.keys())}


@app.on_event("startup")
async def startup_event():
    """Initialize the server on startup"""
    logger.info("Starting LLM server")
    
    # Check if models directory exists
    if not os.path.exists(MODELS_DIR):
        os.makedirs(MODELS_DIR)
        logger.info(f"Created models directory: {MODELS_DIR}")
    
    # Log available models
    logger.info(f"Available models: {list(available_models.keys())}")


if __name__ == "__main__":
    uvicorn.run("llm_server:app", host="0.0.0.0", port=8080, reload=True)