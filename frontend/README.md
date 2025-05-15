# Bio-Viz-LLM Frontend

A modern React frontend for visualizing and analyzing biological datasets with LLM capabilities.

## Features

- 📊 Interactive data visualization and analysis
- 📁 Dataset management and file uploads
- 🤖 AI-powered chat interface for data insights
- 🌓 Dark/light theme support
- ⌨️ Keyboard shortcuts and accessibility features

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm (automatically installed via corepack)

### Installation

1. Enable corepack (ensures the correct pnpm version)
   ```bash
   corepack enable
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Start the development server
   ```bash
   pnpm dev:unique
   ```
   This will start the development server on the dedicated port 53291.

4. Build for production
   ```bash
   pnpm build
   ```

## Development

### Key Commands

- `pnpm dev:unique` - Start development server on port 53291
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm test` - Run tests

### Project Structure

```
frontend/
├── src/
│   ├── features/          # Feature-based modules
│   │   ├── analysis/      # Analysis feature
│   │   ├── chat/          # Chat/LLM feature
│   │   ├── datasets/      # Dataset management feature
│   │   └── visualization/ # Visualization feature
│   ├── shared/            # Shared code
│   │   ├── api/           # API integration
│   │   ├── components/    # Shared UI components
│   │   ├── config/        # Application configuration
│   │   ├── hooks/         # Shared custom hooks
│   │   ├── lib/           # Utility functions
│   │   ├── providers/     # Context providers
│   │   ├── store/         # Zustand stores
│   │   └── types/         # Shared type definitions
│   ├── styles/            # Global styles
│   ├── App.tsx           # Root component
│   ├── main.tsx          # App entry point
│   └── routes.tsx        # React Router routes
└── ... configuration files
```

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **shadcn/ui** - UI components based on Radix UI
- **Tailwind CSS** - Utility-first CSS
- **Zustand + Immer** - State management
- **React Query** - Data fetching
- **React Router** - Routing
- **Recharts** - Charting library
- **Vitest** - Testing framework

## Troubleshooting

### Port Conflicts

The application is configured to run on port 53291. If you're experiencing port conflicts:

1. Check if another process is using port 53291
   ```bash
   lsof -i :53291
   ```

2. If needed, temporarily use a different port
   ```bash
   pnpm dev --port 3000
   ```

### WSL2 Issues

If using WSL2, ensure proper file permissions:

```bash
chmod +x .husky/pre-commit
```

For browser auto-opening issues, add to your `~/.bashrc`:

```bash
export BROWSER="wslview"
```

### Build Failures

If experiencing build failures:

1. Clear node_modules and rebuild
   ```bash
   rm -rf node_modules
   pnpm install
   ```

2. Clear Vite cache
   ```bash
   rm -rf node_modules/.vite
   ```