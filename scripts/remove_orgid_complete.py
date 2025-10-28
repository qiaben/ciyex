#!/usr/bin/env python3
"""
Complete orgId removal script - removes ALL remaining orgId references.
This includes auth services, multi-tenant logic, and commented code.
"""

import re
import sys
from pathlib import Path

def clean_comments(content):
    """Remove orgId references from comments."""
    # Remove single-line comments with orgId
    content = re.sub(r'//.*orgId.*\n', '\n', content)
    
    # Remove orgId from multi-line comments
    content = re.sub(r'/\*[^*]*orgId[^*]*\*/', '', content, flags=re.DOTALL)
    
    return content

def process_file(file_path):
    """Process a single file to remove ALL orgId references."""
    print(f"Processing: {file_path.relative_to(file_path.parents[6])}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = []
    
    # Pattern 1: Remove allowedOrgIds parameter (LabOrderService)
    if re.search(r',\s*List<Long>\s+allowedOrgIds', content):
        content = re.sub(r',\s*List<Long>\s+allowedOrgIds', '', content)
        changes.append("Removed allowedOrgIds parameter")
    
    if re.search(r'List<Long>\s+allowedOrgIds\s*\)', content):
        content = re.sub(r'List<Long>\s+allowedOrgIds\s*\)', ')', content)
        changes.append("Removed allowedOrgIds parameter")
    
    # Pattern 2: Remove error messages with orgId
    if re.search(r'"No orgId available', content):
        content = re.sub(r'"No orgId available[^"]*"', '"Tenant context required"', content)
        changes.append("Updated error messages")
    
    # Pattern 3: Remove ensureRequestContextOrg method
    pattern = r'private\s+void\s+ensureRequestContextOrg\s*\([^)]*\)\s*\{[^}]*\}'
    if re.search(pattern, content, re.DOTALL):
        content = re.sub(pattern, '', content, flags=re.DOTALL)
        changes.append("Removed ensureRequestContextOrg method")
    
    # Pattern 4: Remove authorize method with orgId
    pattern = r'private\s+void\s+authorize\s*\([^)]*orgId[^)]*\)\s*\{[^}]*\}'
    if re.search(pattern, content, re.DOTALL):
        content = re.sub(pattern, '', content, flags=re.DOTALL)
        changes.append("Removed authorize method")
    
    # Pattern 5: Update method signatures - getPendingUsersByOrg
    if re.search(r'getPendingUsersByOrg\s*\(\s*Long\s+orgId\s*\)', content):
        content = re.sub(r'getPendingUsersByOrg\s*\(\s*Long\s+orgId\s*\)', 'getPendingUsers()', content)
        changes.append("Updated getPendingUsersByOrg to getPendingUsers")
    
    # Pattern 6: Update method signatures - listAllForOrg
    if re.search(r'listAllForOrg\s*\(\s*Long\s+orgId\s*,', content):
        content = re.sub(r'listAllForOrg\s*\(\s*Long\s+orgId\s*,\s*', 'listAll(', content)
        changes.append("Updated listAllForOrg to listAll")
    
    # Pattern 7: Update TenantProvisionService signature
    if re.search(r'provisionTenantFromTemplate\s*\(\s*String\s+orgId\s*,', content):
        content = re.sub(r'provisionTenantFromTemplate\s*\(\s*String\s+orgId\s*,\s*', 'provisionTenantFromTemplate(', content)
        changes.append("Updated provisionTenantFromTemplate signature")
    
    # Pattern 8: Remove commented code blocks with orgId
    # Remove entire commented blocks that mention orgId
    content = re.sub(r'/\*[^*]*orgId[^*]*\*/', '', content, flags=re.DOTALL)
    if original_content != content:
        changes.append("Removed commented code with orgId")
    
    # Pattern 9: Clean up JavaDoc with orgId
    if re.search(r'\*\s*@param\s+orgId', content):
        content = re.sub(r'\s*\*\s*@param\s+orgId[^\n]*\n', '', content)
        changes.append("Removed @param orgId from JavaDoc")
    
    # Pattern 10: Remove orgId from log statements
    if re.search(r'log\.(error|info|debug|warn)\([^)]*orgId[^)]*\)', content):
        content = re.sub(r',\s*orgId', '', content)
        changes.append("Removed orgId from log statements")
    
    # Pattern 11: Remove if (orgId == null) checks
    if re.search(r'if\s*\(\s*orgId\s*==\s*null\s*\)', content):
        content = re.sub(r'\s*if\s*\(\s*orgId\s*==\s*null\s*\)[^;]*;', '', content)
        changes.append("Removed orgId null checks")
    
    # Pattern 12: Remove allowedOrgIds checks
    if re.search(r'if\s*\(\s*allowedOrgIds\s*==\s*null', content):
        # Remove the entire if block
        pattern = r'if\s*\(\s*allowedOrgIds\s*==\s*null[^}]*\{[^}]*\}'
        content = re.sub(pattern, '', content, flags=re.DOTALL)
        changes.append("Removed allowedOrgIds checks")
    
    # Pattern 13: Clean up single-line comments
    content = clean_comments(content)
    if original_content != content and "Removed commented code" not in changes:
        changes.append("Cleaned up comments")
    
    # Pattern 14: Remove recordOrgId parameters
    if re.search(r',\s*Long\s+recordOrgId', content):
        content = re.sub(r',\s*Long\s+recordOrgId', '', content)
        changes.append("Removed recordOrgId parameter")
    
    # Pattern 15: Remove Collection<Long> allowedOrgIds
    if re.search(r',\s*Collection<Long>\s+allowedOrgIds', content):
        content = re.sub(r',\s*Collection<Long>\s+allowedOrgIds', '', content)
        changes.append("Removed Collection<Long> allowedOrgIds")
    
    # Only write if changes were made
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ Updated: {', '.join(set(changes))}")
        return True
    else:
        print(f"  ⏭️  No changes needed")
        return False

def main():
    # Get the service directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    service_dir = project_root / "src" / "main" / "java" / "com" / "qiaben" / "ciyex" / "service"
    
    if not service_dir.exists():
        print(f"❌ Service directory not found: {service_dir}")
        sys.exit(1)
    
    print(f"🔍 Complete orgId removal from: {service_dir}\n")
    
    # Process all service files recursively
    service_files = list(service_dir.rglob("*.java"))
    total_files = len(service_files)
    updated_files = 0
    
    for service_file in sorted(service_files):
        if process_file(service_file):
            updated_files += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Complete Removal Finished!")
    print(f"📊 Total files: {total_files}")
    print(f"📝 Updated: {updated_files}")
    print(f"⏭️  Unchanged: {total_files - updated_files}")
    print("=" * 60)

if __name__ == "__main__":
    main()
