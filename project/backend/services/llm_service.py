import uuid
import os
from fastapi import Depends
from datetime import datetime
from typing import List, Optional, Dict, Any

from llama_cpp import Llama
from schemas.llm import (
    LLMRequest,
    LLMResponse,
    AvailableModel,
    ModelTypeEnum,
    Citation
)
from services.file_service import FileService
from services.analysis_service import AnalysisService
from db.database import get_db


class LLMService:
    def __init__(
        self,
        db=Depends(get_db),
        file_service: FileService = Depends(),
        analysis_service: AnalysisService = Depends(),
    ):
        self.db = db
        self.file_service = file_service
        self.analysis_service = analysis_service
        self.models_dir = os.path.join(os.getcwd(), "models")
        os.makedirs(self.models_dir, exist_ok=True)
        
        # Initialize models on startup
        self.models = self._initialize_models()
        self.loaded_models = {}

    def _initialize_models(self) -> Dict[str, AvailableModel]:
        """Initialize available models"""
        models = {
            "llama2-7b-chat": AvailableModel(
                id="llama2-7b-chat",
                name="Llama 2 7B Chat",
                type=ModelTypeEnum.GENERAL,
                description="General purpose chat model",
                context_window=4096,
                parameters="7B",
                version="2",
                local=True
            ),
            "bio-llama-7b": AvailableModel(
                id="bio-llama-7b",
                name="BioLlama 7B",
                type=ModelTypeEnum.BIOMEDICAL,
                description="Specialized for biomedical data",
                context_window=4096,
                parameters="7B",
                version="1.0",
                local=True
            ),
            "proteingpt": AvailableModel(
                id="proteingpt",
                name="ProteinGPT",
                type=ModelTypeEnum.PROTEIN,
                description="Specialized for protein sequence analysis",
                context_window=2048,
                parameters="3B",
                version="1.0",
                local=True
            ),
            "genomics-llama": AvailableModel(
                id="genomics-llama",
                name="Genomics Llama",
                type=ModelTypeEnum.GENOMICS,
                description="Specialized for genomics data",
                context_window=4096,
                parameters="7B",
                version="1.0",
                local=True
            ),
        }
        return models

    def _load_model(self, model_id: str) -> Any:
        """Load a model into memory if not already loaded"""
        if model_id not in self.loaded_models:
            # In a real application, this would load the actual model files
            # For this example, we'll just create a placeholder
            model_info = self.models.get(model_id)
            if not model_info:
                raise ValueError(f"Model with ID {model_id} not found")
                
            # This would be the actual model loading code:
            # model_path = os.path.join(self.models_dir, f"{model_id}.gguf")
            # model = Llama(model_path=model_path, n_ctx=model_info.context_window)
            
            # For demo, just use a placeholder
            model = {"id": model_id, "info": model_info.dict()}
            self.loaded_models[model_id] = model
            
        return self.loaded_models[model_id]

    async def get_available_models(self) -> List[AvailableModel]:
        """Get a list of available LLM models"""
        return list(self.models.values())

    async def process_query(self, request: LLMRequest) -> LLMResponse:
        """Process an LLM query"""
        # Load model
        model = self._load_model(request.model_id)
        
        # Prepare context if requested
        context = ""
        if request.include_context:
            if request.file_id:
                file_info = await self.file_service.get_file_info(request.file_id)
                if file_info:
                    context += f"File information: {file_info.metadata.filename}\n"
                    if file_info.metadata.sample_data:
                        context += f"Sample data: {str(file_info.metadata.sample_data)[:500]}...\n"
            
            if request.analysis_id:
                analysis = await self.analysis_service.get_analysis(request.analysis_id)
                if analysis:
                    context += f"Analysis type: {analysis.analysis_type}\n"
                    if analysis.result and analysis.result.summary:
                        context += f"Analysis summary: {str(analysis.result.summary)[:500]}...\n"
        
        # Prepare system prompt
        system_prompt = request.system_prompt or "You are a bioinformatics assistant. Your task is to help researchers analyze and interpret biological data."
        
        # In a real app, we would call the model with the query
        # For demo purposes, we'll generate a placeholder response
        query_id = str(uuid.uuid4())
        
        # Create placeholder response based on the query and context
        response_text = f"This is a simulated response for the query: '{request.query}'"
        if context:
            response_text += f"\n\nBased on the provided context, I can tell you that this involves bioinformatics data analysis."
        
        # Create citations
        citations = [
            Citation(
                text="Smith et al. (2023). Advances in Bioinformatics Data Visualization.",
                url="https://example.com/paper1",
                title="Advances in Bioinformatics Data Visualization",
                authors=["Smith, J.", "Johnson, A."],
                year=2023
            )
        ]
        
        # Create response
        llm_response = LLMResponse(
            id=query_id,
            model_id=request.model_id,
            query=request.query,
            response=response_text,
            citations=citations,
            confidence=0.92,
            usage={"prompt_tokens": 150, "completion_tokens": 50, "total_tokens": 200},
            created_at=datetime.now()
        )
        
        # Save to database
        await self.db.llm_queries.insert_one(llm_response.dict())
        
        return llm_response

    async def explain_analysis(
        self, 
        analysis_id: str, 
        query: Optional[str] = None
    ) -> LLMResponse:
        """Get an LLM explanation of a specific analysis"""
        # Get analysis data
        analysis = await self.analysis_service.get_analysis(analysis_id)
        if not analysis:
            raise ValueError(f"Analysis with ID {analysis_id} not found")
            
        # Build a custom query if not provided
        if not query:
            query = f"Explain the results of this {analysis.analysis_type} analysis in simple terms."
        
        # Create LLM request
        request = LLMRequest(
            model_id="bio-llama-7b",  # Use biomedical model by default
            query=query,
            analysis_id=analysis_id,
            include_context=True
        )
        
        # Process the query
        return await self.process_query(request)

    async def suggest_analyses(self, file_id: str) -> List[str]:
        """Get LLM suggestions for analyses based on file content"""
        # Get file info
        file_info = await self.file_service.get_file_info(file_id)
        if not file_info:
            raise ValueError(f"File with ID {file_id} not found")
            
        # Create a request to the LLM
        request = LLMRequest(
            model_id="bio-llama-7b",
            query=f"Based on this {file_info.file_type} file, what analyses would you recommend?",
            file_id=file_id,
            include_context=True
        )
        
        # Process the query
        response = await self.process_query(request)
        
        # In a real application, we would parse the response to extract suggestions
        # For demo purposes, we'll return placeholder suggestions based on file type
        
        if file_info.file_type == "fasta":
            return [
                "Sequence alignment",
                "Phylogenetic analysis",
                "Protein structure prediction"
            ]
        elif file_info.file_type in ["csv", "tsv"]:
            return [
                "Differential expression analysis",
                "PCA dimensionality reduction",
                "Clustering analysis"
            ]
        else:
            return [
                "Basic statistical analysis",
                "Data cleaning and preprocessing",
                "Exploratory data visualization"
            ]