#!/bin/bash

# Script to fix remaining compilation errors after orgId removal

echo "🔧 Fixing compilation errors..."
echo ""

# 1. Remove all setOrgId() calls (empty calls)
echo "🔄 Step 1: Removing setOrgId() calls..."
find src/main/java/com/qiaben/ciyex/service -name "*.java" -type f -exec sed -i '/\.setOrgId();/d' {} \;
echo "✅ setOrgId() calls removed"
echo ""

# 2. Remove unused getCurrentOrgId() methods
echo "🔄 Step 2: Removing unused getCurrentOrgId() methods..."
find src/main/java/com/qiaben/ciyex/service -name "*.java" -type f -exec sed -i '/private Long getCurrentOrgId() {/,/^    }$/d' {} \;
echo "✅ getCurrentOrgId() methods removed"
echo ""

# 3. Remove unused getCurrentOrgIdOrThrow() methods
echo "🔄 Step 3: Removing unused getCurrentOrgIdOrThrow() methods..."
find src/main/java/com/qiaben/ciyex/service -name "*.java" -type f -exec sed -i '/private Long getCurrentOrgIdOrThrow() {/,/^    }$/d' {} \;
echo "✅ getCurrentOrgIdOrThrow() methods removed"
echo ""

# 4. Remove PatientInvoice orgId getter/setter
echo "🔄 Step 4: Removing PatientInvoice orgId getter/setter..."
sed -i '/public Long getOrgId() {/,/^    }$/d' src/main/java/com/qiaben/ciyex/entity/PatientInvoice.java
sed -i '/public void setOrgId(Long orgId) {/,/^    }$/d' src/main/java/com/qiaben/ciyex/entity/PatientInvoice.java
echo "✅ PatientInvoice getter/setter removed"
echo ""

# 5. Remove unused imports
echo "🔄 Step 5: Removing unused imports..."
find src/main/java/com/qiaben/ciyex -name "*.java" -type f -exec sed -i '/^import.*LocalDateTime;$/d' {} \; 2>/dev/null || true
echo "✅ Unused imports removed"
echo ""

echo "✅ Compilation error fixes complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Build the project: ./gradlew build"
echo "   2. Check for any remaining errors"
echo "   3. Run tests"
