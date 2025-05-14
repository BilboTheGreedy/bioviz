# BioViz: Interactive Bioinformatics Data Visualization Platform

A self-contained web application for interactive visualization, analysis, and natural language querying of bioinformatics datasets. The platform integrates with local LLMs to enable conversational data analysis.

## Features

- **File Upload & Parsing**: Support for CSV and XLSX files with schema preview
- **Multiple Analysis Methods**: Descriptive, diagnostic, predictive, time-series, etc.
- **Interactive Visualizations**: Zoom, pan, brush-select, hover tooltips
- **LLM-Powered Data Chat**: Query your data using natural language
- **Downloadable Assets**: Export charts and slides for presentations
- **Fully Offline**: No external API calls, works completely locally

## Quick Start

There are multiple ways to start the application depending on your needs:

### Option 1: Simple Mode (Recommended for first run)
```bash
# Start with the simplified Docker configuration (no build needed)
./start.sh simple
```

### Option 2: Alternative Mode (Static Frontend)
```bash
# Start with static frontend (no frontend build needed)
./start.sh alt
```

### Option 3: Full Build
```bash
# Start with the full build process
./start.sh
# or directly with docker-compose
docker-compose up -d
```

### Option 4: Backend Only
```bash
# Start only the backend and LLM services
./start.sh backend-only
```

Then open your browser to `http://localhost:3000`

## Requirements

- Docker and Docker Compose
- 4GB+ RAM for running the application
- No GPU required (configured for CPU-only operation)

## Architecture

The application consists of three main services:

1. **Frontend**: React/TypeScript application with Tailwind CSS (`http://localhost:3000`)
2. **Backend**: Python/FastAPI server for data processing and analysis (`http://localhost:8000`)
3. **LLM Service**: Ollama server for natural language processing (`http://localhost:8090`)

## Project Structure

- `/backend`: FastAPI server with analysis modules
- `/frontend`: React+Vite client application
- `/data`: Data storage including sample datasets
- `/models`: Directory for LLM models
- `docker-compose.yml`: Multi-service configuration

## Configuration

You can configure the application by modifying environment variables in `docker-compose.yml`:

- `LLM_MODEL_TYPE`: Set to 'ollama' by default, can also be 'llama' or 'huggingface'
- `LLM_MODEL_PATH`: Path to the model file (for llama and huggingface types)
- `MAX_UPLOAD_SIZE`: Maximum file upload size (200MB default)

## Troubleshooting

### Common Issues

If you encounter issues with the Docker build:

1. Ensure Docker has sufficient resources (4GB+ RAM recommended)
2. If using the llama.cpp integration instead of ollama, additional system dependencies may be required
3. View logs with `docker-compose logs -f service_name` (where service_name is backend, frontend, or llm)

## Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Sample Data

Sample datasets are provided in the `data/sample` directory:
- `gene_expression.csv`: Sample gene expression data
- `patient_metadata.csv`: Sample patient metadata

## License

MIT
