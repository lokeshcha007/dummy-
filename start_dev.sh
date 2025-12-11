#!/bin/bash
# Start script for Next.js development server
# This bypasses permission issues by using npx

cd "$(dirname "$0")"

echo "🚀 Starting Next.js development server..."
echo "📍 Port: 1002"
echo ""

# Use npx to run next directly (bypasses .bin permission issues)
npx next dev -p 1002

