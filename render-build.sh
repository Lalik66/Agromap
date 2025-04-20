#!/usr/bin/env bash
# Script for building the application on Render

echo "Starting Agromap Azerbaijan build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Install client dependencies and build
echo "Building client application..."
cd client && npm install && npm run build
cd ..

# Clean server node_modules if exists
echo "Cleaning server dependencies..."
rm -rf server/node_modules || true

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

# Copy client build to server's public directory
echo "Copying client build to server..."
mkdir -p server/dist/public
cp -r client/.next server/dist/public/
cp -r client/public/* server/dist/public/ || true

echo "Build process completed successfully!" 