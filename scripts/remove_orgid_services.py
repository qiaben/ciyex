#!/usr/bin/env python3
"""
Script to remove orgId parameters from Spring Boot service classes.
This script:
1. Removes Long orgId parameters from method signatures
2. Removes setOrgId() calls on entities
3. Removes getCurrentOrgId() helper methods
4. Updates setSearchPath() to use tenant name from RequestContext
5. Updates repository calls to remove orgId arguments
"""

import re
import sys
from pathlib import Path

def process_service(file_path):
    """Process a single service file to remove orgId references."""
    print(f"Processing: {file_path.name}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = []
    
    # Pattern 1: Remove .setOrgId() calls
    if re.search(r'\.setOrgId\s*\([^)]*\)\s*;', content):
        content = re.sub(r'\s*\w+\.setOrgId\s*\([^)]*\)\s*;', '', content)
        changes.append("Removed setOrgId() calls")
    
    # Pattern 2: Remove getCurrentOrgId() method
    pattern_get_org = r'private\s+Long\s+getCurrentOrgId\s*\(\s*\)\s*\{[^}]*\}'
    if re.search(pattern_get_org, content, re.DOTALL):
        content = re.sub(pattern_get_org, '', content, flags=re.DOTALL)
        changes.append("Removed getCurrentOrgId() method")
    
    # Pattern 3: Remove getCurrentOrgIdOrThrow() method
    pattern_get_org_throw = r'private\s+Long\s+getCurrentOrgIdOrThrow\s*\(\s*\)\s*\{[^}]*\}'
    if re.search(pattern_get_org_throw, content, re.DOTALL):
        content = re.sub(pattern_get_org_throw, '', content, flags=re.DOTALL)
        changes.append("Removed getCurrentOrgIdOrThrow() method")
    
    # Pattern 4: Remove verifyOrgId() method
    pattern_verify = r'private\s+void\s+verifyOrgId\s*\([^)]*\)\s*\{[^}]*\}'
    if re.search(pattern_verify, content, re.DOTALL):
        content = re.sub(pattern_verify, '', content, flags=re.DOTALL)
        changes.append("Removed verifyOrgId() method")
    
    # Pattern 5: Remove setSearchPath method entirely (no longer needed with single instance)
    pattern_search_path = r'private\s+void\s+setSearchPath\s*\(\s*Long\s+orgId\s*\)\s*\{[^}]+\}'
    if re.search(pattern_search_path, content, re.DOTALL):
        content = re.sub(pattern_search_path, '', content, flags=re.DOTALL)
        changes.append("Removed setSearchPath() method")
    
    # Pattern 6: Remove Long orgId from method parameters (first parameter)
    if re.search(r'\(Long\s+orgId\s*,', content):
        content = re.sub(r'\(Long\s+orgId\s*,\s*', '(', content)
        changes.append("Removed orgId from method parameters (first param)")
    
    # Pattern 7: Remove Long orgId from method parameters (last parameter)
    if re.search(r',\s*Long\s+orgId\s*\)', content):
        content = re.sub(r',\s*Long\s+orgId\s*\)', ')', content)
        changes.append("Removed orgId from method parameters (last param)")
    
    # Pattern 8: Remove Long orgId from method parameters (only parameter)
    if re.search(r'\(Long\s+orgId\s*\)', content):
        content = re.sub(r'\(Long\s+orgId\s*\)', '()', content)
        changes.append("Removed orgId from method parameters (only param)")
    
    # Pattern 9: Remove setSearchPath() calls entirely
    if re.search(r'\s*setSearchPath\s*\(\s*orgId\s*\)\s*;', content):
        content = re.sub(r'\s*setSearchPath\s*\(\s*orgId\s*\)\s*;', '', content)
        changes.append("Removed setSearchPath() calls")
    if re.search(r'\s*setSearchPath\s*\(\s*\)\s*;', content):
        content = re.sub(r'\s*setSearchPath\s*\(\s*\)\s*;', '', content)
        changes.append("Removed setSearchPath() calls")
    
    # Pattern 10: Remove orgId from fromDto calls
    if re.search(r'fromDto\s*\(\s*orgId\s*,', content):
        content = re.sub(r'fromDto\s*\(\s*orgId\s*,\s*', 'fromDto(', content)
        changes.append("Removed orgId from fromDto() calls")
    
    # Pattern 11: Update fromDto method signature
    if re.search(r'private\s+\w+\s+fromDto\s*\(\s*Long\s+orgId\s*,', content):
        content = re.sub(r'(private\s+\w+\s+fromDto\s*)\(\s*Long\s+orgId\s*,\s*', r'\1(', content)
        changes.append("Updated fromDto() signature")
    
    # Pattern 12: Remove r.orgId = orgId; assignments
    if re.search(r'\w+\.orgId\s*=\s*orgId\s*;', content):
        content = re.sub(r'\s*\w+\.orgId\s*=\s*orgId\s*;', '', content)
        changes.append("Removed orgId assignments")
    
    # Pattern 13: Remove storage calls with orgId
    if re.search(r'storage\.(\w+)\s*\([^,)]+,\s*orgId\s*\)', content):
        content = re.sub(r'(storage\.\w+\s*\([^,)]+),\s*orgId\s*\)', r'\1)', content)
        changes.append("Removed orgId from storage calls")
    
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
    
    print(f"🔍 Scanning services in: {service_dir}\n")
    
    # Process all service files
    service_files = list(service_dir.glob("*Service.java"))
    total_files = len(service_files)
    updated_files = 0
    
    for service_file in sorted(service_files):
        if process_service(service_file):
            updated_files += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Processing Complete!")
    print(f"📊 Total services: {total_files}")
    print(f"📝 Updated: {updated_files}")
    print(f"⏭️  Unchanged: {total_files - updated_files}")
    print("=" * 60)
    print("\n⚠️  Note: Some services may need manual review:")
    print("  - LabOrderService (multi-tenant logic)")
    print("  - TenantAccessService (auth logic)")
    print("  - KeycloakAuthService (auth logic)")

if __name__ == "__main__":
    main()
