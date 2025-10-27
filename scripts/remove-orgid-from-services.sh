#!/bin/bash

# Script to remove orgId parameters from service files
# This handles method parameters and variable declarations

SERVICE_DIR="src/main/java/com/qiaben/ciyex/service"

echo "🔧 Starting orgId removal from services..."
echo "📁 Working directory: $SERVICE_DIR"
echo ""

# Backup services first
echo "📦 Creating backup..."
tar -czf services-backup-$(date +%Y%m%d-%H%M%S).tar.gz $SERVICE_DIR
echo "✅ Backup created"
echo ""

# 1. Remove Long orgId, from method parameters (with comma)
echo "🔄 Step 1: Removing 'Long orgId,' parameters..."
find $SERVICE_DIR -name "*.java" -type f -exec sed -i 's/Long orgId,[ \t]*//g' {} \;
echo "✅ Parameters with comma removed"
echo ""

# 2. Remove Long orgId) from method parameters (at end)
echo "🔄 Step 2: Removing 'Long orgId)' parameters..."
find $SERVICE_DIR -name "*.java" -type f -exec sed -i 's/Long orgId)/)/g' {} \;
echo "✅ Parameters at end removed"
echo ""

# 3. Remove standalone Long orgId; declarations
echo "🔄 Step 3: Removing 'Long orgId;' variable declarations..."
find $SERVICE_DIR -name "*.java" -type f -exec sed -i '/^[ \t]*Long orgId;$/d' {} \;
echo "✅ Variable declarations removed"
echo ""

# 4. Remove Long orgId = lines (variable assignments)
echo "🔄 Step 4: Removing 'Long orgId = ...' assignments..."
find $SERVICE_DIR -name "*.java" -type f -exec sed -i '/^[ \t]*Long orgId = /d' {} \;
echo "✅ Variable assignments removed"
echo ""

# 5. Remove orgId, from method calls (first parameter)
echo "🔄 Step 5: Removing 'orgId,' from method calls..."
find $SERVICE_DIR -name "*.java" -type f -exec sed -i 's/(orgId,[ \t]*/(/g' {} \;
echo "✅ Method call parameters removed"
echo ""

# 6. Remove , orgId) from method calls (last parameter)
echo "🔄 Step 6: Removing ', orgId)' from method calls..."
find $SERVICE_DIR -name "*.java" -type f -exec sed -i 's/,[ \t]*orgId)/)/g' {} \;
echo "✅ Last parameters removed"
echo ""

# 7. Remove (orgId) - single parameter calls
echo "🔄 Step 7: Removing '(orgId)' single parameter calls..."
find $SERVICE_DIR -name "*.java" -type f -exec sed -i 's/(orgId)/()/g' {} \;
echo "✅ Single parameter calls removed"
echo ""

echo "✅ Automated changes complete!"
echo ""
echo "⚠️  IMPORTANT: Please review all changes before committing:"
echo "   1. Check for compilation errors"
echo "   2. Review method signatures"
echo "   3. Ensure logic still makes sense"
echo "   4. Run tests"
echo ""
echo "📝 To see changes: git diff $SERVICE_DIR"
echo "🔙 To restore backup: tar -xzf services-backup-*.tar.gz"
