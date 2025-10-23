#\!/bin/bash

# Install dependencies for all projects

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "========================================="
echo "Installing Dependencies"
echo "========================================="

# Check if EHR UI needs dependencies
if [ -d "$PROJECT_DIR/ciyex-ehr-ui" ]; then
    if [ \! -d "$PROJECT_DIR/ciyex-ehr-ui/node_modules" ]; then
        echo "[1/2] Installing EHR UI dependencies..."
        cd "$PROJECT_DIR/ciyex-ehr-ui"
        npm install --silent
        echo "✅ EHR UI dependencies installed"
    else
        echo "✅ EHR UI dependencies already installed"
    fi
fi

# Check if Portal UI needs dependencies
if [ -d "$PROJECT_DIR/ciyex-patient-portal" ]; then
    if [ \! -d "$PROJECT_DIR/ciyex-patient-portal/node_modules" ]; then
        echo "[2/2] Installing Portal UI dependencies..."
        cd "$PROJECT_DIR/ciyex-patient-portal"
        npm install --silent
        echo "✅ Portal UI dependencies installed"
    else
        echo "✅ Portal UI dependencies already installed"
    fi
fi

echo "========================================="
echo "✅ All dependencies ready"
echo "========================================="
