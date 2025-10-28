#!/usr/bin/env python3
"""
Script to remove all orgId references from Spring Boot controllers.
This script:
1. Removes  and @RequestHeader("x-org-id") Long orgId
2. Removes @PathVariable Long orgId
3. Updates service method calls to remove orgId arguments
4. Updates URL paths to remove {orgId}
"""

import re
import os
import sys
from pathlib import Path

def process_controller(file_path):
    """Process a single controller file to remove orgId references."""
    print(f"Processing: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = []
    
    # Pattern 1: Remove  with comma after
    pattern1 = r'@RequestHeader\("orgId"\)\s+Long\s+orgId,\s*'
    if re.search(pattern1, content):
        content = re.sub(pattern1, '', content)
        changes.append("Removed @RequestHeader(\"orgId\") with comma")
    
    # Pattern 2: Remove @RequestHeader("x-org-id") Long orgId with comma after
    pattern2 = r'@RequestHeader\("x-org-id"\)\s+Long\s+orgId,\s*'
    if re.search(pattern2, content):
        content = re.sub(pattern2, '', content)
        changes.append("Removed @RequestHeader(\"x-org-id\") with comma")
    
    # Pattern 3: Remove  without comma (last param)
    pattern3 = r',\s*@RequestHeader\("orgId"\)\s+Long\s+orgId\)'
    if re.search(pattern3, content):
        content = re.sub(pattern3, ')', content)
        changes.append("Removed @RequestHeader(\"orgId\") without comma")
    
    # Pattern 4: Remove @RequestHeader("x-org-id") Long orgId without comma (last param)
    pattern4 = r',\s*@RequestHeader\("x-org-id"\)\s+Long\s+orgId\)'
    if re.search(pattern4, content):
        content = re.sub(pattern4, ')', content)
        changes.append("Removed @RequestHeader(\"x-org-id\") without comma")
    
    # Pattern 5: Remove @PathVariable Long orgId with comma after
    pattern5 = r'@PathVariable\s+Long\s+orgId,\s*'
    if re.search(pattern5, content):
        content = re.sub(pattern5, '', content)
        changes.append("Removed @PathVariable Long orgId with comma")
    
    # Pattern 6: Remove @PathVariable Long orgId without comma (last param)
    pattern6 = r',\s*@PathVariable\s+Long\s+orgId\)'
    if re.search(pattern6, content):
        content = re.sub(pattern6, ')', content)
        changes.append("Removed @PathVariable Long orgId without comma")
    
    # Pattern 7: Remove orgId as first argument in service calls
    pattern7 = r'\.(\w+)\(orgId,\s*'
    if re.search(pattern7, content):
        content = re.sub(pattern7, r'.\1(', content)
        changes.append("Removed orgId from service calls (first arg)")
    
    # Pattern 8: Remove orgId as last argument in service calls
    pattern8 = r',\s*orgId\)'
    if re.search(pattern8, content):
        content = re.sub(pattern8, ')', content)
        changes.append("Removed orgId from service calls (last arg)")
    
    # Pattern 9: Remove orgId as only argument in service calls
    pattern9 = r'\.(\w+)\(orgId\)'
    if re.search(pattern9, content):
        content = re.sub(pattern9, r'.\1()', content)
        changes.append("Removed orgId from service calls (only arg)")
    
    # Pattern 10: Update @RequestMapping paths - remove {orgId}/
    pattern10 = r'@RequestMapping\("(/api)?/{orgId}/'
    if re.search(pattern10, content):
        content = re.sub(pattern10, r'@RequestMapping("\1/', content)
        changes.append("Updated @RequestMapping path")
    
    # Pattern 11: Update @GetMapping, @PostMapping, etc. paths
    for method in ['GetMapping', 'PostMapping', 'PutMapping', 'DeleteMapping', 'PatchMapping']:
        pattern = rf'@{method}\("/{{\s*orgId\s*}}/'
        if re.search(pattern, content):
            content = re.sub(pattern, f'@{method}("/', content)
            changes.append(f"Updated @{method} path")
    
    # Only write if changes were made
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ Updated: {', '.join(changes)}")
        return True
    else:
        print(f"  ⏭️  No changes needed")
        return False

def main():
    # Get the controller directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    controller_dir = project_root / "src" / "main" / "java" / "com" / "qiaben" / "ciyex" / "controller"
    
    if not controller_dir.exists():
        print(f"❌ Controller directory not found: {controller_dir}")
        sys.exit(1)
    
    print(f"🔍 Scanning controllers in: {controller_dir}\n")
    
    # Process all controller files
    controller_files = list(controller_dir.glob("*Controller.java"))
    total_files = len(controller_files)
    updated_files = 0
    
    for controller_file in sorted(controller_files):
        if process_controller(controller_file):
            updated_files += 1
        print()
    
    print("=" * 60)
    print(f"✅ Phase 1 Complete!")
    print(f"📊 Total controllers: {total_files}")
    print(f"📝 Updated: {updated_files}")
    print(f"⏭️  Unchanged: {total_files - updated_files}")
    print("=" * 60)

if __name__ == "__main__":
    main()
