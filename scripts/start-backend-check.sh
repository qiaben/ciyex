#\!/bin/bash

# Ciyex Backend Pre-Launch Script
# Compiles code, checks port, and kills existing process if needed

set -e

PORT=8080
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "========================================="
echo "Ciyex Backend Pre-Launch Check"
echo "========================================="

# Step 1: Compile
echo "[1/3] Compiling Java code..."
cd "$PROJECT_DIR"
./gradlew compileJava --no-daemon --quiet
if [ $? -eq 0 ]; then
    echo "✅ Compilation successful"
else
    echo "❌ Compilation failed\!"
    exit 1
fi

# Step 2: Check and kill port
echo "[2/3] Checking port $PORT..."
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)
    echo "⚠️  Port $PORT is in use by PID $PID"
    echo "   Killing process..."
    kill -9 $PID 2>/dev/null || true
    sleep 1
    echo "✅ Port $PORT freed"
else
    echo "✅ Port $PORT is available"
fi

# Step 3: Build
echo "[3/3] Building application..."
./gradlew build -x test --no-daemon --quiet
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed\!"
    exit 1
fi

echo "========================================="
echo "✅ Ready to launch backend"
echo "========================================="
