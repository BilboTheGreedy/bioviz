import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import analysis, files, llm, visualization

app = FastAPI(
    title="Bioinformatics Visualizer API",
    description="A FastAPI backend for bioinformatics data visualization with LLM integration",
    version="0.1.0",
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(files.router, prefix="/api/files", tags=["Files"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(visualization.router, prefix="/api/visualization", tags=["Visualization"])
app.include_router(llm.router, prefix="/api/llm", tags=["LLM"])

@app.get("/")
async def root():
    return {"message": "Welcome to Bioinformatics Visualizer API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)