# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bio-Viz-LLM is a full-stack application for visualizing and analyzing biological datasets with LLM capabilities:

- **Frontend**: React 18 + TypeScript + Vite application using shadcn/ui components
- **Backend**: FastAPI Python application providing RESTful API endpoints
- **LLM Service**: Local LLM integration via Ollama for AI-powered data insights

The application architecture follows a microservices pattern with Docker containerization.

## System Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │   Backend   │     │  LLM Server │
│  (Port 3001)│────▶│  (Port 8000)│────▶│ (Port 8090) │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────┐
│                 Shared Volumes                  │
│      (data/, models/, persistent storage)       │
└─────────────────────────────────────────────────┘
```

## Common Commands

### Starting the Application

```bash
# Start the full application stack with Docker
./start.sh

# Start with simplified setup (no build required)
./start.sh simple

# Start with alternative setup (nginx static frontend)
./start.sh alt

# Start only backend and LLM services
./start.sh backend-only
```

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Enable corepack for consistent pnpm version
corepack enable

# Install dependencies
pnpm install

# Start development server on dedicated port 53291
pnpm dev:unique

# Type checking and linting
pnpm typecheck
pnpm lint

# Testing
pnpm test
```

### API Testing

```bash
# Test API endpoints
./test-api.sh
```

## Frontend Architecture

The frontend follows a feature-based architecture:

### Core Architecture Patterns

1. **Feature-based organization**: Code organized by domain rather than by technical concern
2. **Global state management**: Zustand + Immer for immutable state updates
3. **Data fetching**: React Query for caching and async state management
4. **UI components**: shadcn/ui (Radix UI + Tailwind CSS) for accessible components
5. **Routing**: React Router v6 with lazy-loaded components

### Directory Structure

```
frontend/
├── src/
│   ├── features/           # Feature-based modules
│   │   ├── analysis/       # Analysis-related components and logic
│   │   ├── chat/           # LLM chat interface
│   │   ├── datasets/       # File upload and dataset management
│   │   └── visualization/  # Chart and table components
│   ├── shared/             # Shared code
│   │   ├── api/            # API client and type definitions
│   │   ├── components/     # Core UI components (shadcn/ui)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── store/          # Zustand stores
│   │   └── types/          # Shared type definitions
│   ├── styles/             # Global styles
│   ├── routes.tsx          # React Router routes
│   └── main.tsx            # Entry point
```

## Backend Architecture

The FastAPI backend provides RESTful API endpoints for:

### Key APIs

1. **File Management** (`/api/files`): Upload, list, and manage datasets
2. **Analysis** (`/api/analysis`): Run various analysis methods on datasets
3. **LLM Integration** (`/api/llm`): Query large language models for insights
4. **Export** (`/api/export`): Export analysis results in various formats

The backend uses Python 3.9+ with scientific computing libraries:
- `pandas`, `numpy`, `scikit-learn` for data analysis
- `plotly` for chart generation
- `langchain` for LLM integration

## Environment Variables

```
# Frontend
VITE_API_URL=http://localhost:8000  # Backend API URL

# Backend
LLM_MODEL_PATH=/models/model.gguf   # Path to LLM model
LLM_MODEL_TYPE=ollama               # LLM integration type
LLM_SERVER_URL=http://llm:8080      # LLM server URL
MAX_UPLOAD_SIZE=209715200           # Max file upload size (bytes)
```

## Docker Setup

The application uses Docker Compose with three main services:
1. **frontend**: Static files served via Nginx on port 3001
2. **backend**: FastAPI service on port 8000
3. **llm**: Ollama LLM server on port 8090

## Important Notes

1. The frontend dev server MUST use port 53291 for development to avoid conflicts
2. Use pnpm with corepack to ensure consistent package management
3. All frontend file paths should use absolute imports (via `@/` alias)
4. Tests should use React Testing Library's best practices
5. The backend API expects uploads in `/data` directory
6. LLM models should be placed in the `/models` directory