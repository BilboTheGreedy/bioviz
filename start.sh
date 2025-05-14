#!/bin/bash

# BioViz Startup Script

echo "Starting BioViz Platform..."

# Check which Docker Compose file to use
if [ "$1" == "simple" ]; then
    echo "Using simplified Docker setup (no build required)"
    docker-compose -f docker-compose.simple.yml up -d
elif [ "$1" == "alt" ]; then
    echo "Using alternative Docker setup (nginx static frontend)"
    docker-compose -f docker-compose.yml -f docker-compose.alt.yml up -d
elif [ "$1" == "backend-only" ]; then
    echo "Starting only the backend and LLM services"
    docker-compose up -d backend llm
else
    echo "Starting with full build setup"
    docker-compose up -d
fi

echo ""
echo "Services should be available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- LLM Service: http://localhost:8080"
echo ""
echo "To check service status: docker-compose ps"
echo "To view logs: docker-compose logs -f"
echo "To stop services: docker-compose down"