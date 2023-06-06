#!/bin/bash

# Exit immediately if any command fails
set -e

# Pull latest changes from Git
if ! git pull; then
    echo "Error: Failed to pull latest changes from Git"
    exit 1
fi

# Install dependencies
if ! cnpm install; then
    echo "Error: Failed to install dependencies with cnpm"
    exit 1
fi

# Start the application
if ! npm start; then
    echo "Error: Failed to start the application"
    exit 1
fi
