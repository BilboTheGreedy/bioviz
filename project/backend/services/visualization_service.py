import uuid
import os
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from fastapi import Depends
from datetime import datetime
from typing import List, Optional, Dict, Any

from schemas.visualization import (
    VisualizationRequest, 
    VisualizationResponse,
    VisualizationData,
    ExportFormat
)
from services.analysis_service import AnalysisService
from db.database import get_db


class VisualizationService:
    def __init__(
        self,
        db=Depends(get_db),
        analysis_service: AnalysisService = Depends()
    ):
        self.db = db
        self.analysis_service = analysis_service
        self.visualization_dir = os.path.join(os.getcwd(), "visualizations")
        os.makedirs(self.visualization_dir, exist_ok=True)
        
        # Map visualization types to appropriate rendering functions
        self.viz_renderers = {
            "heatmap": self._render_heatmap,
            "scatter_plot": self._render_scatter_plot,
            "line_chart": self._render_line_chart,
            "bar_chart": self._render_bar_chart,
            "box_plot": self._render_box_plot,
            "violin_plot": self._render_violin_plot,
            "network_graph": self._render_network_graph,
            "phylogenetic_tree": self._render_phylogenetic_tree,
            "volcano_plot": self._render_volcano_plot,
            "pca_plot": self._render_pca_plot,
            "tsne_plot": self._render_tsne_plot,
            "umap_plot": self._render_umap_plot,
        }

    async def create_visualization(self, request: VisualizationRequest) -> VisualizationResponse:
        """Create a new visualization"""
        # Check if analysis exists
        analysis = await self.analysis_service.get_analysis(request.analysis_id)
        if not analysis:
            raise ValueError(f"Analysis with ID {request.analysis_id} not found")
        
        if analysis.status != "completed":
            raise ValueError(f"Analysis is not completed (status: {analysis.status})")
        
        # Create visualization ID and paths
        viz_id = str(uuid.uuid4())
        viz_path = os.path.join(self.visualization_dir, viz_id)
        os.makedirs(viz_path, exist_ok=True)
        
        # Generate visualization
        viz_type = request.config.type
        if viz_type in self.viz_renderers:
            viz_file, thumbnail_file, raw_data, interactive_config = await self.viz_renderers[viz_type](
                analysis, request.config, viz_path
            )
        else:
            raise ValueError(f"Unsupported visualization type: {viz_type}")
        
        # Create response data
        viz_data = VisualizationData(
            url=f"/api/visualization/{viz_id}/view",
            thumbnail_url=f"/api/visualization/{viz_id}/thumbnail" if thumbnail_file else None,
            raw_data=raw_data,
            interactive_config=interactive_config
        )
        
        # Save to database
        now = datetime.now()
        viz_db_data = {
            "id": viz_id,
            "analysis_id": request.analysis_id,
            "config": request.config.dict(),
            "data": viz_data.dict(),
            "description": request.description,
            "created_at": now,
            "updated_at": now
        }
        
        await self.db.visualizations.insert_one(viz_db_data)
        
        return VisualizationResponse(**viz_db_data)

    async def get_visualization(self, visualization_id: str) -> Optional[VisualizationResponse]:
        """Get visualization by ID"""
        viz_data = await self.db.visualizations.find_one({"id": visualization_id})
        if not viz_data:
            return None
            
        return VisualizationResponse(**viz_data)

    async def list_visualizations(
        self,
        analysis_id: Optional[str] = None,
        limit: int = 10,
        offset: int = 0
    ) -> List[VisualizationResponse]:
        """List visualizations with optional filtering"""
        # Build query
        query = {}
        if analysis_id:
            query["analysis_id"] = analysis_id
            
        # Execute query
        cursor = self.db.visualizations.find(query).sort("created_at", -1).skip(offset).limit(limit)
        visualizations = await cursor.to_list(length=limit)
        
        return [VisualizationResponse(**viz) for viz in visualizations]

    async def export_visualization(
        self,
        visualization_id: str,
        format: ExportFormat
    ) -> Dict[str, Any]:
        """Export visualization to specified format"""
        viz = await self.get_visualization(visualization_id)
        if not viz:
            raise ValueError(f"Visualization with ID {visualization_id} not found")
            
        viz_path = os.path.join(self.visualization_dir, visualization_id)
        export_file = f"{visualization_id}_export.{format.value}"
        export_path = os.path.join(viz_path, export_file)
        
        # Load the visualization and export it
        if format in [ExportFormat.PNG, ExportFormat.SVG, ExportFormat.PDF]:
            # For image formats, we need to regenerate or convert the visualization
            analysis = await self.analysis_service.get_analysis(viz.analysis_id)
            viz_type = viz.config.type
            
            if viz_type in self.viz_renderers:
                # Regenerate with specific format
                await self.viz_renderers[viz_type](
                    analysis, viz.config, viz_path, export_format=format
                )
        elif format == ExportFormat.CSV:
            # Export raw data as CSV
            if not viz.data.raw_data:
                raise ValueError("No raw data available for CSV export")
            
            # Would convert raw_data to CSV and save to export_path
            pass
            
        elif format == ExportFormat.JSON:
            # Export raw data as JSON
            if not viz.data.raw_data:
                raise ValueError("No raw data available for JSON export")
                
            # Would save raw_data as JSON to export_path
            pass
            
        # Return download URL
        return {
            "download_url": f"/api/visualization/{visualization_id}/download/{export_file}",
            "filename": export_file,
            "format": format
        }

    async def delete_visualization(self, visualization_id: str) -> bool:
        """Delete a visualization by ID"""
        # Delete files
        viz_path = os.path.join(self.visualization_dir, visualization_id)
        if os.path.exists(viz_path):
            for file in os.listdir(viz_path):
                os.remove(os.path.join(viz_path, file))
            os.rmdir(viz_path)
            
        # Delete from database
        result = await self.db.visualizations.delete_one({"id": visualization_id})
        return result.deleted_count > 0

    # Helper methods to render different visualization types
    async def _render_heatmap(self, analysis, config, viz_path, export_format=None):
        """Render a heatmap visualization"""
        # Implementation would extract data from analysis.result and render heatmap
        # For demo purposes, we'll create a simple placeholder
        plt.figure(figsize=(10, 8))
        sns.heatmap(
            [[1, 2, 3], [4, 5, 6], [7, 8, 9]], 
            annot=True, 
            cmap="YlGnBu"
        )
        plt.title(config.title or "Heatmap Visualization")
        
        # Save visualization
        viz_file = os.path.join(viz_path, "visualization.png")
        plt.savefig(viz_file)
        
        # Save thumbnail
        plt.figure(figsize=(5, 4))
        sns.heatmap(
            [[1, 2, 3], [4, 5, 6], [7, 8, 9]], 
            annot=False, 
            cmap="YlGnBu"
        )
        thumbnail_file = os.path.join(viz_path, "thumbnail.png")
        plt.savefig(thumbnail_file)
        
        # Save export format if specified
        if export_format:
            export_file = os.path.join(viz_path, f"export.{export_format.value}")
            plt.savefig(export_file, format=export_format.value)
        
        plt.close('all')
        
        # Prepare raw data for API response
        raw_data = {"matrix": [[1, 2, 3], [4, 5, 6], [7, 8, 9]]}
        
        # Prepare interactive configuration
        interactive_config = {
            "library": "plotly",
            "type": "heatmap",
            "data": raw_data,
            "layout": {"title": config.title or "Heatmap Visualization"}
        }
        
        return viz_file, thumbnail_file, raw_data, interactive_config

    async def _render_scatter_plot(self, analysis, config, viz_path, export_format=None):
        """Render a scatter plot visualization"""
        # Implementation placeholder
        return "", "", {}, {}

    async def _render_line_chart(self, analysis, config, viz_path, export_format=None):
        """Render a line chart visualization"""
        # Implementation placeholder
        return "", "", {}, {}

    async def _render_bar_chart(self, analysis, config, viz_path, export_format=None):
        """Render a bar chart visualization"""
        # Implementation placeholder
        return "", "", {}, {}

    async def _render_box_plot(self, analysis, config, viz_path, export_format=None):
        """Render a box plot visualization"""
        # Implementation placeholder
        return "", "", {}, {}

    async def _render_violin_plot(self, analysis, config, viz_path, export_format=None):
        """Render a violin plot visualization"""
        # Implementation placeholder
        return "", "", {}, {}

    async def _render_network_graph(self, analysis, config, viz_path, export_format=None):
        """Render a network graph visualization"""
        # Implementation placeholder
        return "", "", {}, {}

    async def _render_phylogenetic_tree(self, analysis, config, viz_path, export_format=None):
        """Render a phylogenetic tree visualization"""
        # Implementation placeholder
        return "", "", {}, {}

    async def _render_volcano_plot(self, analysis, config, viz_path, export_format=None):
        """Render a volcano plot visualization"""
        # Implementation placeholder
        return "", "", {}, {}

    async def _render_pca_plot(self, analysis, config, viz_path, export_format=None):
        """Render a PCA plot visualization"""
        # Implementation placeholder
        return "", "", {}, {}

    async def _render_tsne_plot(self, analysis, config, viz_path, export_format=None):
        """Render a t-SNE plot visualization"""
        # Implementation placeholder
        return "", "", {}, {}

    async def _render_umap_plot(self, analysis, config, viz_path, export_format=None):
        """Render a UMAP plot visualization"""
        # Implementation placeholder
        return "", "", {}, {}