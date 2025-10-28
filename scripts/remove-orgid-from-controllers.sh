#!/bin/bash

# Script to remove orgId parameters from controller files
# This is a semi-automated approach - review changes before committing!

CONTROLLER_DIR="src/main/java/com/qiaben/ciyex/controller"

echo "🔧 Starting orgId removal from controllers..."
echo "📁 Working directory: $CONTROLLER_DIR"
echo ""

# Backup controllers first
echo "📦 Creating backup..."
tar -czf controllers-backup-$(date +%Y%m%d-%H%M%S).tar.gz $CONTROLLER_DIR
echo "✅ Backup created"
echo ""

# 1. Remove {orgId}/ from URL paths in @RequestMapping
echo "🔄 Step 1: Removing {orgId} from URL paths..."
find $CONTROLLER_DIR -name "*.java" -type f -exec sed -i 's|/api/{orgId}/patients|/api/patients|g' {} \;
find $CONTROLLER_DIR -name "*.java" -type f -exec sed -i 's|/api/{orgId}/|/api/|g' {} \;
echo "✅ URL paths updated"
echo ""

# 2. Remove @PathVariable Long orgId, (with comma and space)
echo "🔄 Step 2: Removing @PathVariable Long orgId parameters..."
find $CONTROLLER_DIR -name "*.java" -type f -exec sed -i 's/@PathVariable Long orgId,[ \t]*//g' {} \;
find $CONTROLLER_DIR -name "*.java" -type f -exec sed -i 's/@PathVariable Long orgId)/)/' {} \;
echo "✅ @PathVariable parameters removed"
echo ""

# 3. Remove
echo "🔄 Step 3: Removing @RequestHeader orgId parameters..."
find $CONTROLLER_DIR -name "*.java" -type f -exec sed -i 's/,[ \t]*//g' {} \;
find $CONTROLLER_DIR -name "*.java" -type f -exec sed -i 's/)/)/' {} \;
find $CONTROLLER_DIR -name "*.java" -type f -exec sed -i 's/,[ \t]*//g' {} \;
find $CONTROLLER_DIR -name "*.java" -type f -exec sed -i 's/)/)/' {} \;
echo "✅ @RequestHeader parameters removed"
echo ""

# 4. Remove orgId from service method calls (common patterns)
echo "🔄 Step 4: Removing orgId from service calls (basic patterns)..."
# This is tricky and may need manual review
find $CONTROLLER_DIR -name "*.java" -type f -exec sed -i 's/service\.\([a-zA-Z]*\)(orgId,/service.\1(null, \/\/ orgId removed/g' {} \;
echo "⚠️  Service calls updated - MANUAL REVIEW REQUIRED"
echo ""

echo "✅ Automated changes complete!"
echo ""
echo "⚠️  IMPORTANT: Please review all changes before committing:"
echo "   1. Check for compilation errors"
echo "   2. Review service method calls"
echo "   3. Update corresponding service methods to handle null orgId"
echo "   4. Run tests"
echo ""
echo "📝 To see changes: git diff $CONTROLLER_DIR"
echo "🔙 To restore backup: tar -xzf controllers-backup-*.tar.gz"
