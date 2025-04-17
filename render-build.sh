#!/usr/bin/env bash
# Script for building the application on Render

echo "Starting Agromap Azerbaijan build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Install server dependencies
echo "Installing server dependencies..."
cd server && npm install
cd ..

# Build server
echo "Building server..."
cd server && npm run build
cd ..

# Create uploads directory if it doesn't exist
echo "Setting up uploads directory..."
mkdir -p server/uploads

echo "Build process completed successfully!" 