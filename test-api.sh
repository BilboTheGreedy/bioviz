#!/bin/bash

echo "Testing BioViz API endpoints..."
echo ""

# Test health endpoint
echo "1. Testing API health endpoint:"
curl -s http://localhost:8000/api/health | jq || echo "Failed to connect to health endpoint"
echo ""

# List available analysis methods
echo "2. Testing analysis methods endpoint:"
curl -s http://localhost:8000/api/analysis/methods | jq || echo "Failed to connect to analysis methods endpoint"
echo ""

# List files
echo "3. Testing file list endpoint:"
curl -s http://localhost:8000/api/files/list | jq || echo "Failed to connect to file list endpoint"
echo ""

echo "API test complete. If any endpoint failed, ensure the backend service is running."
echo "To restart the services, run: docker-compose down && docker-compose up -d"
echo ""
echo "Frontend should be available at: http://localhost:3001"