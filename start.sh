#!/bin/bash

# Start Docker Compose
echo "Starting application with Docker Compose..."
docker-compose up -d --build

# Wait for a moment for services to start
sleep 10

# Open Frontend
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:8080
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:8080
else
    echo "Please open http://localhost:8080 in your browser."
fi
