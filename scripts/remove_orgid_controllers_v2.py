#!/usr/bin/env python3
"""
Enhanced script to remove all orgId references from Spring Boot controllers.
Handles various @RequestHeader formats and patterns.
"""

import re
import sys
from pathlib import Path

def process_controller(file_path):
    """Process a single controller file to remove orgId references."""
    print(f"Processing: {file_path.name}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = []
    
    # Pattern 1: @RequestHeader with various formats - with comma after
    patterns_with_comma = [
        r'@RequestHeader\s*\(\s*"orgId"\s*\)\s+Long\s+orgId\s*,\s*',
        r'@RequestHeader\s*\(\s*"x-org-id"\s*\)\s+Long\s+orgId\s*,\s*',
        r'@RequestHeader\s*\(\s*"X-Org-Id"\s*\)\s+Long\s+orgId\s*,\s*',
        r'@RequestHeader\s*\(\s*name\s*=\s*"orgId"\s*,\s*required\s*=\s*false\s*\)\s+Long\s+orgId\s*,\s*',
        r'@RequestHeader\s*\(\s*name\s*=\s*"x-org-id"\s*,\s*required\s*=\s*false\s*\)\s+Long\s+orgId\s*,\s*',
        r'@RequestHeader\s*\(\s*name\s*=\s*"X-Org-Id"\s*,\s*required\s*=\s*false\s*\)\s+Long\s+orgId\s*,\s*',
        r'@RequestHeader\s*\(\s*value\s*=\s*"X-Org-Id"\s*,\s*required\s*=\s*false\s*\)\s+String\s+orgHeader\s*,\s*',
    ]
    
    for pattern in patterns_with_comma:
        if re.search(pattern, content):
            content = re.sub(pattern, '', content)
            changes.append("Removed @RequestHeader with comma")
            break
    
    # Pattern 2: @RequestHeader without comma (last parameter or only parameter)
    patterns_without_comma = [
        r',\s*@RequestHeader\s*\(\s*"orgId"\s*\)\s+Long\s+orgId\s*\)',
        r',\s*@RequestHeader\s*\(\s*"x-org-id"\s*\)\s+Long\s+orgId\s*\)',
        r',\s*@RequestHeader\s*\(\s*"X-Org-Id"\s*\)\s+Long\s+orgId\s*\)',
        r',\s*@RequestHeader\s*\(\s*name\s*=\s*"orgId"\s*,\s*required\s*=\s*false\s*\)\s+Long\s+orgId\s*\)',
        r',\s*@RequestHeader\s*\(\s*name\s*=\s*"x-org-id"\s*,\s*required\s*=\s*false\s*\)\s+Long\s+orgId\s*\)',
        r',\s*@RequestHeader\s*\(\s*name\s*=\s*"X-Org-Id"\s*,\s*required\s*=\s*false\s*\)\s+Long\s+orgId\s*\)',
        r',\s*@RequestHeader\s*\(\s*value\s*=\s*"X-Org-Id"\s*,\s*required\s*=\s*false\s*\)\s+String\s+orgHeader\s*\)',
    ]
    
    for pattern in patterns_without_comma:
        if re.search(pattern, content):
            content = re.sub(pattern, ')', content)
            changes.append("Removed @RequestHeader without comma")
            break
    
    # Pattern 3: @PathVariable Long orgId with comma
    if re.search(r'@PathVariable\s+Long\s+orgId\s*,\s*', content):
        content = re.sub(r'@PathVariable\s+Long\s+orgId\s*,\s*', '', content)
        changes.append("Removed @PathVariable with comma")
    
    # Pattern 4: @PathVariable Long orgId without comma
    if re.search(r',\s*@PathVariable\s+Long\s+orgId\s*\)', content):
        content = re.sub(r',\s*@PathVariable\s+Long\s+orgId\s*\)', ')', content)
        changes.append("Removed @PathVariable without comma")
    
    # Pattern 5: Remove service calls with orgId as first argument
    if re.search(r'service\.(\w+)\(orgId\s*,', content):
        content = re.sub(r'service\.(\w+)\(orgId\s*,\s*', r'service.\1(', content)
        changes.append("Removed orgId from service calls (first arg)")
    
    # Pattern 6: Remove service calls with orgId as last argument
    if re.search(r',\s*orgId\s*\)', content):
        content = re.sub(r',\s*orgId\s*\)', ')', content)
        changes.append("Removed orgId from service calls (last arg)")
    
    # Pattern 7: Remove service calls with orgId as only argument
    if re.search(r'service\.(\w+)\(orgId\s*\)', content):
        content = re.sub(r'service\.(\w+)\(orgId\s*\)', r'service.\1()', content)
        changes.append("Removed orgId from service calls (only arg)")
    
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
    
    print("\n" + "=" * 60)
    print(f"✅ Processing Complete!")
    print(f"📊 Total controllers: {total_files}")
    print(f"📝 Updated: {updated_files}")
    print(f"⏭️  Unchanged: {total_files - updated_files}")
    print("=" * 60)

if __name__ == "__main__":
    main()
