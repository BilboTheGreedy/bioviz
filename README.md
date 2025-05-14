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

```bash
# Clone the repository
git clone https://github.com/yourusername/bioviz.git
cd bioviz

# Start the application with Docker Compose
docker-compose up
```

Then open your browser to `http://localhost:3000`

## Requirements

- Docker and Docker Compose
- GPU support (optional, for faster LLM inference)

## Project Structure

- `/backend`: FastAPI server with analysis modules
- `/frontend`: React+Vite client application
- `/docker`: Docker configuration files

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

## License

MIT
