import uuid
from fastapi import Depends
from datetime import datetime
from typing import List, Optional, Dict, Any

from schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    AnalysisStatus,
    AnalysisResult
)
from services.file_service import FileService
from db.database import get_db
from core.analysis import (
    sequence_alignment,
    clustering,
    dimensionality_reduction,
    differential_expression,
    phylogenetic_analysis,
    variant_calling,
    functional_enrichment,
    pathway_analysis,
    network_analysis
)


class AnalysisService:
    def __init__(
        self, 
        db=Depends(get_db),
        file_service: FileService = Depends()
    ):
        self.db = db
        self.file_service = file_service
        self.analysis_methods = {
            "sequence_alignment": sequence_alignment.run_analysis,
            "clustering": clustering.run_analysis,
            "dimensionality_reduction": dimensionality_reduction.run_analysis,
            "differential_expression": differential_expression.run_analysis,
            "phylogenetic_analysis": phylogenetic_analysis.run_analysis,
            "variant_calling": variant_calling.run_analysis,
            "functional_enrichment": functional_enrichment.run_analysis,
            "pathway_analysis": pathway_analysis.run_analysis,
            "network_analysis": network_analysis.run_analysis
        }

    async def create_analysis(self, request: AnalysisRequest) -> AnalysisResponse:
        """Create a new analysis job"""
        # Check if file exists
        file_info = await self.file_service.get_file_info(request.file_id)
        if not file_info:
            raise ValueError(f"File with ID {request.file_id} not found")
        
        # Create analysis record
        analysis_id = str(uuid.uuid4())
        now = datetime.now()
        
        analysis_data = {
            "id": analysis_id,
            "file_id": request.file_id,
            "analysis_type": request.analysis_type,
            "parameters": request.parameters.dict(),
            "status": AnalysisStatus.PENDING,
            "description": request.description,
            "created_at": now,
            "updated_at": now
        }
        
        # Save to database
        await self.db.analyses.insert_one(analysis_data)
        
        # Start analysis process (would be async in production)
        try:
            # Update status to running
            await self.db.analyses.update_one(
                {"id": analysis_id},
                {"$set": {"status": AnalysisStatus.RUNNING, "updated_at": datetime.now()}}
            )
            
            # Run appropriate analysis method
            if request.analysis_type in self.analysis_methods:
                result = await self.analysis_methods[request.analysis_type](
                    file_info, request.parameters.dict()
                )
                
                # Update with results
                await self.db.analyses.update_one(
                    {"id": analysis_id},
                    {
                        "$set": {
                            "status": AnalysisStatus.COMPLETED,
                            "result": result.dict(),
                            "updated_at": datetime.now()
                        }
                    }
                )
            else:
                raise ValueError(f"Unsupported analysis type: {request.analysis_type}")
                
        except Exception as e:
            # Update with error
            await self.db.analyses.update_one(
                {"id": analysis_id},
                {
                    "$set": {
                        "status": AnalysisStatus.FAILED,
                        "error_message": str(e),
                        "updated_at": datetime.now()
                    }
                }
            )
            raise
        
        # Return updated analysis data
        updated_data = await self.db.analyses.find_one({"id": analysis_id})
        return AnalysisResponse(**updated_data)

    async def get_analysis(self, analysis_id: str) -> Optional[AnalysisResponse]:
        """Get analysis by ID"""
        analysis_data = await self.db.analyses.find_one({"id": analysis_id})
        if not analysis_data:
            return None
        
        return AnalysisResponse(**analysis_data)

    async def list_analyses(
        self, 
        file_id: Optional[str] = None,
        status: Optional[AnalysisStatus] = None,
        limit: int = 10,
        offset: int = 0
    ) -> List[AnalysisResponse]:
        """List analyses with optional filtering"""
        # Build query
        query = {}
        if file_id:
            query["file_id"] = file_id
        if status:
            query["status"] = status
        
        # Execute query
        cursor = self.db.analyses.find(query).sort("created_at", -1).skip(offset).limit(limit)
        analyses = await cursor.to_list(length=limit)
        
        return [AnalysisResponse(**analysis) for analysis in analyses]

    async def delete_analysis(self, analysis_id: str) -> bool:
        """Delete an analysis by ID"""
        result = await self.db.analyses.delete_one({"id": analysis_id})
        return result.deleted_count > 0