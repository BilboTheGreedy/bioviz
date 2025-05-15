# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bio-Viz-LLM is a React application for visualizing and analyzing biological datasets with LLM capabilities. The frontend is built with React 18, TypeScript, and Vite, using shadcn/ui components (Radix UI + Tailwind CSS). It communicates with a FastAPI backend.

## Common Commands

### Development

```bash
# Enable corepack for consistent pnpm version
corepack enable

# Install dependencies
pnpm install

# Start development server on dedicated port 53291
pnpm dev:unique

# Start development server with auto-assigned port
pnpm dev

# Type checking
pnpm typecheck

# Lint
pnpm lint
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Building

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Architecture

The project follows a feature-based architecture:

### Core Architecture Patterns

1. **Feature-based organization**: Code is organized by domain/feature rather than by technical concern
2. **Global state management**: Zustand + Immer for simple, immutable state updates
3. **Data fetching**: React Query for caching and async state management
4. **UI components**: shadcn/ui (Radix UI + Tailwind CSS) for accessible, customizable components
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
│   ├── shared/             # Shared utilities and components
│   │   ├── api/            # API client and type definitions
│   │   ├── components/     # Core UI components (shadcn/ui)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── store/          # Zustand state stores
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Entry point
```

### Key Modules

1. **File Management**: Upload and manage datasets (features/datasets)
2. **Analysis**: Select and run analysis methods (features/analysis)
3. **Visualization**: Interactive charts and tables (features/visualization)
4. **Chat**: LLM interface for data insights (features/chat)

### State Management

The application uses Zustand stores with Immer for immutable updates:

- **fileStore**: Manages uploaded files and datasets
- **analysisStore**: Handles analysis methods and results
- **chatStore**: Manages chat sessions and messages
- **uiStore**: Controls UI state like theme, sidebar, and active page

### API Integration

- Uses Axios for API requests
- React Query for data fetching, caching, and synchronization
- API endpoints are organized by domain (files, analysis, llm)

### Error Handling

- React Error Boundary for component-level error handling
- Global error state in stores
- Toast notifications for user feedback

### Styling

- Tailwind CSS for utility-first styling
- CSS variables for theming (light/dark mode)
- Responsive design with mobile-first approach

## Important Notes

1. The application MUST use port 53291 for development to avoid port conflicts
2. Use pnpm with corepack to ensure consistent package management
3. All file paths must be absolute (use @ imports with the configured alias)
4. Tests should use React Testing Library's best practices