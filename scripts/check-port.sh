#\!/bin/bash

# Check and free port script
# Usage: check-port.sh <port> <service-name>

PORT=$1
SERVICE_NAME=$2

echo "========================================="
echo "Checking port $PORT for $SERVICE_NAME"
echo "========================================="

if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)
    echo "⚠️  Port $PORT is in use by PID $PID"
    echo "   Killing process..."
    kill -9 $PID 2>/dev/null || true
    sleep 1
    
    # Verify port is free
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "❌ Failed to free port $PORT"
        exit 1
    fi
    echo "✅ Port $PORT freed"
else
    echo "✅ Port $PORT is available"
fi

echo "========================================="
