from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import os
import logging
from typing import Optional, List, Dict, Any, Union
import json

from app.core.config import settings
from app.api.routes import file_router, analysis_router, llm_router, export_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize FastAPI application
app = FastAPI(
    title="BioViz API",
    description="API for bioinformatics data visualization and analysis",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(file_router.router, prefix="/api/files", tags=["files"])
app.include_router(analysis_router.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(llm_router.router, prefix="/api/llm", tags=["llm"])
app.include_router(export_router.router, prefix="/api/export", tags=["export"])

@app.get("/")
async def root():
    return {"message": "BioViz API is running"}

@app.get("/api/health")
async def health_check():
    from datetime import datetime
    return {"status": "healthy", "timestamp": str(datetime.now())}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
