#!/usr/bin/env python3
"""
Enhanced script to remove remaining orgId references from services.
Handles edge cases and method calls.
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
    
    # Pattern 1: Remove method calls with orgId as middle argument
    # e.g., updateStatus(id, patientId, orgId, status) -> updateStatus(id, patientId, status)
    if re.search(r',\s*orgId\s*,', content):
        content = re.sub(r',\s*orgId\s*,', ', ', content)
        changes.append("Removed orgId from method calls (middle arg)")
    
    # Pattern 2: Update method signatures with orgId in middle
    # e.g., method(Long id, Long patientId, Long orgId, Status status)
    if re.search(r',\s*Long\s+orgId\s*,', content):
        content = re.sub(r',\s*Long\s+orgId\s*,', ', ', content)
        changes.append("Removed Long orgId from signatures (middle param)")
    
    # Pattern 3: Remove orgId from error messages and logs
    if re.search(r'orgId="\s*\+\s*orgId', content):
        content = re.sub(r'orgId="\s*\+\s*orgId', 'tenant', content)
        changes.append("Updated error messages")
    
    # Pattern 4: Remove orgId from log statements
    if re.search(r'orgId=\{\}["\']?,\s*orgId', content):
        content = re.sub(r',?\s*orgId=\{\}["\']?,\s*orgId', '', content)
        changes.append("Removed orgId from log statements")
    
    # Pattern 5: Update S3 paths from orgId to tenant name
    # "documents/" + orgId + "/" -> "documents/" + tenantName + "/"
    if re.search(r'"documents/"\s*\+\s*orgId\s*\+', content):
        content = re.sub(
            r'"documents/"\s*\+\s*orgId\s*\+',
            '"documents/" + com.qiaben.ciyex.context.RequestContext.get().getTenantName() +',
            content
        )
        changes.append("Updated S3 document paths")
    
    # Pattern 6: Remove .getS3DocumentStorage(orgId) -> .getS3DocumentStorage()
    if re.search(r'\.getS3DocumentStorage\s*\(\s*orgId\s*\)', content):
        content = re.sub(r'\.getS3DocumentStorage\s*\(\s*orgId\s*\)', '.getS3DocumentStorage()', content)
        changes.append("Removed orgId from S3 config calls")
    
    # Pattern 7: Remove createDefaultSettings(orgId) -> createDefaultSettings()
    if re.search(r'createDefaultSettings\s*\(\s*orgId\s*\)', content):
        content = re.sub(r'createDefaultSettings\s*\(\s*orgId\s*\)', 'createDefaultSettings()', content)
        changes.append("Removed orgId from createDefaultSettings")
    
    # Pattern 8: Remove get(orgId) calls -> get()
    if re.search(r'\bget\s*\(\s*orgId\s*\)', content):
        content = re.sub(r'\bget\s*\(\s*orgId\s*\)', 'get()', content)
        changes.append("Removed orgId from get() calls")
    
    # Pattern 9: Remove tenantNameFromOrgId(orgId) -> null or remove
    if re.search(r'tenantNameFromOrgId\s*\(\s*orgId\s*\)', content):
        content = re.sub(r'tenantNameFromOrgId\s*\(\s*orgId\s*\)', 'null', content)
        changes.append("Removed tenantNameFromOrgId calls")
    
    # Pattern 10: Remove "practice_" + orgId -> use tenant name
    if re.search(r'"practice_"\s*\+\s*orgId', content):
        content = re.sub(
            r'"practice_"\s*\+\s*orgId',
            'com.qiaben.ciyex.context.RequestContext.get().getTenantName()',
            content
        )
        changes.append("Updated practice schema references")
    
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
    
    # Process all service files recursively
    service_files = list(service_dir.rglob("*Service.java"))
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

if __name__ == "__main__":
    main()
